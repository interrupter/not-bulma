var notBulma = (function (exports) {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    /* src/ui.breadcrumbs.svelte generated by Svelte v3.23.2 */

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (23:4) {:else }
    function create_else_block(ctx) {
    	let li;
    	let a;
    	let t_value = /*link*/ ctx[4].title + "";
    	let t;
    	let a_href_value;
    	let a_data_href_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    			attr(a, "href", a_href_value = "" + (/*root*/ ctx[0] + /*link*/ ctx[4].url));
    			attr(a, "data-href", a_data_href_value = /*link*/ ctx[4].url);
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			append(li, a);
    			append(a, t);

    			if (!mounted) {
    				dispose = listen(a, "click", /*onClick*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*items*/ 2 && t_value !== (t_value = /*link*/ ctx[4].title + "")) set_data(t, t_value);

    			if (dirty & /*root, items*/ 3 && a_href_value !== (a_href_value = "" + (/*root*/ ctx[0] + /*link*/ ctx[4].url))) {
    				attr(a, "href", a_href_value);
    			}

    			if (dirty & /*items*/ 2 && a_data_href_value !== (a_data_href_value = /*link*/ ctx[4].url)) {
    				attr(a, "data-href", a_data_href_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (21:4) {#if (items.length === (index + 1)) }
    function create_if_block(ctx) {
    	let li;
    	let a;
    	let t_value = /*link*/ ctx[4].title + "";
    	let t;
    	let a_href_value;
    	let a_data_href_value;

    	return {
    		c() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    			attr(a, "href", a_href_value = "" + (/*root*/ ctx[0] + /*link*/ ctx[4].url));
    			attr(a, "data-href", a_data_href_value = /*link*/ ctx[4].url);
    			attr(a, "aria-current", "page");
    			attr(li, "class", "is-active");
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			append(li, a);
    			append(a, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*items*/ 2 && t_value !== (t_value = /*link*/ ctx[4].title + "")) set_data(t, t_value);

    			if (dirty & /*root, items*/ 3 && a_href_value !== (a_href_value = "" + (/*root*/ ctx[0] + /*link*/ ctx[4].url))) {
    				attr(a, "href", a_href_value);
    			}

    			if (dirty & /*items*/ 2 && a_data_href_value !== (a_data_href_value = /*link*/ ctx[4].url)) {
    				attr(a, "data-href", a_data_href_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    		}
    	};
    }

    // (20:4) {#each items as link, index}
    function create_each_block(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*items*/ ctx[1].length === /*index*/ ctx[6] + 1) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function create_fragment(ctx) {
    	let nav;
    	let ul;
    	let each_value = /*items*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c() {
    			nav = element("nav");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(nav, "class", "breadcrumb");
    			attr(nav, "aria-label", "breadcrumbs");
    		},
    		m(target, anchor) {
    			insert(target, nav, anchor);
    			append(nav, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*root, items, onClick*/ 7) {
    				each_value = /*items*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(nav);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { root = "" } = $$props;
    	let { items = [] } = $$props;
    	let { go = null } = $$props;

    	function onClick(ev) {
    		if (typeof go === "function") {
    			ev.preventDefault();
    			go(ev.currentTarget.dataset.href);
    			return false;
    		} else {
    			return true;
    		}
    	}

    	$$self.$set = $$props => {
    		if ("root" in $$props) $$invalidate(0, root = $$props.root);
    		if ("items" in $$props) $$invalidate(1, items = $$props.items);
    		if ("go" in $$props) $$invalidate(3, go = $$props.go);
    	};

    	return [root, items, onClick, go];
    }

    class Ui_breadcrumbs extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment, safe_not_equal, { root: 0, items: 1, go: 3 });
    	}
    }

    /* src/ui.error.svelte generated by Svelte v3.23.2 */

    function create_fragment$1(ctx) {
    	let article;
    	let div0;
    	let p;
    	let t0;
    	let t1;
    	let div1;
    	let t2;

    	return {
    		c() {
    			article = element("article");
    			div0 = element("div");
    			p = element("p");
    			t0 = text(/*title*/ ctx[1]);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(/*message*/ ctx[0]);
    			attr(div0, "class", "message-header");
    			attr(div1, "class", "message-body");
    			attr(article, "class", "message is-danger");
    		},
    		m(target, anchor) {
    			insert(target, article, anchor);
    			append(article, div0);
    			append(div0, p);
    			append(p, t0);
    			append(article, t1);
    			append(article, div1);
    			append(div1, t2);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*title*/ 2) set_data(t0, /*title*/ ctx[1]);
    			if (dirty & /*message*/ 1) set_data(t2, /*message*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(article);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { message } = $$props;
    	let { title } = $$props;

    	$$self.$set = $$props => {
    		if ("message" in $$props) $$invalidate(0, message = $$props.message);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    	};

    	return [message, title];
    }

    class Ui_error extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { message: 0, title: 1 });
    	}
    }

    /* src/ui.side.menu.items.svelte generated by Svelte v3.23.2 */

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (32:1) {:else }
    function create_else_block_1(ctx) {
    	let li;
    	let a;
    	let t_value = /*item*/ ctx[5].title + "";
    	let t;

    	return {
    		c() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			append(li, a);
    			append(a, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*items*/ 2 && t_value !== (t_value = /*item*/ ctx[5].title + "")) set_data(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(li);
    		}
    	};
    }

    // (30:1) {#if item.url }
    function create_if_block_2(ctx) {
    	let li;
    	let a;
    	let t_value = /*item*/ ctx[5].title + "";
    	let t;
    	let a_href_value;
    	let a_data_href_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    			attr(a, "href", a_href_value = "" + (/*root*/ ctx[0] + /*item*/ ctx[5].url));
    			attr(a, "data-href", a_data_href_value = /*item*/ ctx[5].url);
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			append(li, a);
    			append(a, t);

    			if (!mounted) {
    				dispose = listen(a, "click", /*onClick*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*items*/ 2 && t_value !== (t_value = /*item*/ ctx[5].title + "")) set_data(t, t_value);

    			if (dirty & /*root, items*/ 3 && a_href_value !== (a_href_value = "" + (/*root*/ ctx[0] + /*item*/ ctx[5].url))) {
    				attr(a, "href", a_href_value);
    			}

    			if (dirty & /*items*/ 2 && a_data_href_value !== (a_data_href_value = /*item*/ ctx[5].url)) {
    				attr(a, "data-href", a_data_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(li);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (20:1) {#if item.items && item.items.length }
    function create_if_block$1(ctx) {
    	let li;
    	let t0;
    	let ui_side_menu_items;
    	let t1;
    	let current;

    	function select_block_type_1(ctx, dirty) {
    		if (/*item*/ ctx[5].url) return create_if_block_1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	ui_side_menu_items = new Ui_side_menu_items({
    			props: {
    				items: /*item*/ ctx[5].items,
    				root: /*root*/ ctx[0]
    			}
    		});

    	ui_side_menu_items.$on("navigate", /*navigate_handler*/ ctx[3]);

    	return {
    		c() {
    			li = element("li");
    			if_block.c();
    			t0 = space();
    			create_component(ui_side_menu_items.$$.fragment);
    			t1 = space();
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			if_block.m(li, null);
    			append(li, t0);
    			mount_component(ui_side_menu_items, li, null);
    			append(li, t1);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(li, t0);
    				}
    			}

    			const ui_side_menu_items_changes = {};
    			if (dirty & /*items*/ 2) ui_side_menu_items_changes.items = /*item*/ ctx[5].items;
    			if (dirty & /*root*/ 1) ui_side_menu_items_changes.root = /*root*/ ctx[0];
    			ui_side_menu_items.$set(ui_side_menu_items_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(ui_side_menu_items.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(ui_side_menu_items.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			if_block.d();
    			destroy_component(ui_side_menu_items);
    		}
    	};
    }

    // (24:2) {:else}
    function create_else_block$1(ctx) {
    	let a;
    	let t_value = /*item*/ ctx[5].title + "";
    	let t;

    	return {
    		c() {
    			a = element("a");
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);
    			append(a, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*items*/ 2 && t_value !== (t_value = /*item*/ ctx[5].title + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(a);
    		}
    	};
    }

    // (22:2) {#if item.url }
    function create_if_block_1(ctx) {
    	let a;
    	let t_value = /*item*/ ctx[5].title + "";
    	let t;
    	let a_href_value;
    	let a_data_href_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			a = element("a");
    			t = text(t_value);
    			attr(a, "href", a_href_value = "" + (/*root*/ ctx[0] + /*item*/ ctx[5].url));
    			attr(a, "data-href", a_data_href_value = /*item*/ ctx[5].url);
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);
    			append(a, t);

    			if (!mounted) {
    				dispose = listen(a, "click", /*onClick*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*items*/ 2 && t_value !== (t_value = /*item*/ ctx[5].title + "")) set_data(t, t_value);

    			if (dirty & /*root, items*/ 3 && a_href_value !== (a_href_value = "" + (/*root*/ ctx[0] + /*item*/ ctx[5].url))) {
    				attr(a, "href", a_href_value);
    			}

    			if (dirty & /*items*/ 2 && a_data_href_value !== (a_data_href_value = /*item*/ ctx[5].url)) {
    				attr(a, "data-href", a_data_href_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(a);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (19:0) {#each items as item}
    function create_each_block$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_if_block_2, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[5].items && /*item*/ ctx[5].items.length) return 0;
    		if (/*item*/ ctx[5].url) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	let ul;
    	let current;
    	let each_value = /*items*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(ul, "class", "menu-list");
    		},
    		m(target, anchor) {
    			insert(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*items, root, onClick*/ 7) {
    				each_value = /*items*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { root = "" } = $$props;
    	let { items = [] } = $$props;

    	function onClick(ev) {
    		ev.preventDefault();

    		dispatch("navigate", {
    			full: ev.target.getAttribute("href"),
    			short: ev.target.dataset.href
    		});

    		return false;
    	}

    	function navigate_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("root" in $$props) $$invalidate(0, root = $$props.root);
    		if ("items" in $$props) $$invalidate(1, items = $$props.items);
    	};

    	return [root, items, onClick, navigate_handler];
    }

    class Ui_side_menu_items extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { root: 0, items: 1 });
    	}
    }

    /* src/ui.side.menu.section.svelte generated by Svelte v3.23.2 */

    function create_if_block_1$1(ctx) {
    	let p;
    	let t_value = /*section*/ ctx[0].title + "";
    	let t;

    	return {
    		c() {
    			p = element("p");
    			t = text(t_value);
    			attr(p, "class", "menu-label");
    		},
    		m(target, anchor) {
    			insert(target, p, anchor);
    			append(p, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*section*/ 1 && t_value !== (t_value = /*section*/ ctx[0].title + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(p);
    		}
    	};
    }

    // (14:0) {#if sectionItems.length }
    function create_if_block$2(ctx) {
    	let uisidemenuitems;
    	let current;

    	uisidemenuitems = new Ui_side_menu_items({
    			props: {
    				root: /*root*/ ctx[1],
    				items: /*sectionItems*/ ctx[2]
    			}
    		});

    	uisidemenuitems.$on("navigate", /*navigate_handler*/ ctx[4]);

    	return {
    		c() {
    			create_component(uisidemenuitems.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uisidemenuitems, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uisidemenuitems_changes = {};
    			if (dirty & /*root*/ 2) uisidemenuitems_changes.root = /*root*/ ctx[1];
    			if (dirty & /*sectionItems*/ 4) uisidemenuitems_changes.items = /*sectionItems*/ ctx[2];
    			uisidemenuitems.$set(uisidemenuitems_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uisidemenuitems.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uisidemenuitems.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uisidemenuitems, detaching);
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*section*/ ctx[0] && create_if_block_1$1(ctx);
    	let if_block1 = /*sectionItems*/ ctx[2].length && create_if_block$2(ctx);

    	return {
    		c() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*section*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*sectionItems*/ ctx[2].length) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*sectionItems*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach(if_block1_anchor);
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { section } = $$props;
    	let { items = [] } = $$props;
    	let { root = "" } = $$props;

    	function navigate_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("section" in $$props) $$invalidate(0, section = $$props.section);
    		if ("items" in $$props) $$invalidate(3, items = $$props.items);
    		if ("root" in $$props) $$invalidate(1, root = $$props.root);
    	};

    	let sectionItems;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*items, section*/ 9) {
    			 $$invalidate(2, sectionItems = items.filter(item => section.id === item.section));
    		}
    	};

    	return [section, root, sectionItems, items, navigate_handler];
    }

    class Ui_side_menu_section extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { section: 0, items: 3, root: 1 });
    	}
    }

    /* src/ui.side.menu.svelte generated by Svelte v3.23.2 */

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (19:1) {#each sections as section}
    function create_each_block$2(ctx) {
    	let uisidemenusection;
    	let current;

    	uisidemenusection = new Ui_side_menu_section({
    			props: {
    				section: /*section*/ ctx[6],
    				items: /*items*/ ctx[1],
    				root: /*root*/ ctx[0]
    			}
    		});

    	uisidemenusection.$on("navigate", /*onClick*/ ctx[3]);

    	return {
    		c() {
    			create_component(uisidemenusection.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(uisidemenusection, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uisidemenusection_changes = {};
    			if (dirty & /*sections*/ 4) uisidemenusection_changes.section = /*section*/ ctx[6];
    			if (dirty & /*items*/ 2) uisidemenusection_changes.items = /*items*/ ctx[1];
    			if (dirty & /*root*/ 1) uisidemenusection_changes.root = /*root*/ ctx[0];
    			uisidemenusection.$set(uisidemenusection_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uisidemenusection.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uisidemenusection.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(uisidemenusection, detaching);
    		}
    	};
    }

    function create_fragment$4(ctx) {
    	let aside;
    	let current;
    	let each_value = /*sections*/ ctx[2];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			aside = element("aside");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(aside, "class", "menu");
    		},
    		m(target, anchor) {
    			insert(target, aside, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(aside, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*sections, items, root, onClick*/ 15) {
    				each_value = /*sections*/ ctx[2];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(aside, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(aside);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { title = "Side menu" } = $$props;
    	let { root = "" } = $$props;
    	let { items = [] } = $$props;
    	let { sections = [] } = $$props;
    	let { navigate = null } = $$props;

    	function onClick(ev) {
    		if (typeof navigate === "function") {
    			navigate(ev.detail);
    		}
    	}

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(4, title = $$props.title);
    		if ("root" in $$props) $$invalidate(0, root = $$props.root);
    		if ("items" in $$props) $$invalidate(1, items = $$props.items);
    		if ("sections" in $$props) $$invalidate(2, sections = $$props.sections);
    		if ("navigate" in $$props) $$invalidate(5, navigate = $$props.navigate);
    	};

    	return [root, items, sections, onClick, title, navigate];
    }

    class Ui_side_menu extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			title: 4,
    			root: 0,
    			items: 1,
    			sections: 2,
    			navigate: 5
    		});
    	}
    }

    /* src/ui.tag.svelte generated by Svelte v3.23.2 */

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (53:4) {#each items as item (item.id)}
    function create_each_block_1(key_1, ctx) {
    	let span;
    	let t_value = /*item*/ ctx[11].title + "";
    	let t;
    	let button;
    	let button_data_id_value;
    	let span_class_value;
    	let mounted;
    	let dispose;

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			span = element("span");
    			t = text(t_value);
    			button = element("button");
    			attr(button, "data-id", button_data_id_value = /*item*/ ctx[11].id);
    			attr(button, "class", "delete is-small");
    			attr(span, "class", span_class_value = "mx-1 tag is-" + /*item*/ ctx[11].type);
    			this.first = span;
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    			append(span, button);

    			if (!mounted) {
    				dispose = listen(button, "click", /*remove*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*items*/ 1 && t_value !== (t_value = /*item*/ ctx[11].title + "")) set_data(t, t_value);

    			if (dirty & /*items*/ 1 && button_data_id_value !== (button_data_id_value = /*item*/ ctx[11].id)) {
    				attr(button, "data-id", button_data_id_value);
    			}

    			if (dirty & /*items*/ 1 && span_class_value !== (span_class_value = "mx-1 tag is-" + /*item*/ ctx[11].type)) {
    				attr(span, "class", span_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (62:10) {#each variants as variant}
    function create_each_block$3(ctx) {
    	let option;
    	let t_value = /*variant*/ ctx[8].title + "";
    	let t;
    	let option_value_value;

    	return {
    		c() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*variant*/ ctx[8].id;
    			option.value = option.__value;
    		},
    		m(target, anchor) {
    			insert(target, option, anchor);
    			append(option, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*variants*/ 2 && t_value !== (t_value = /*variant*/ ctx[8].title + "")) set_data(t, t_value);

    			if (dirty & /*variants*/ 2 && option_value_value !== (option_value_value = /*variant*/ ctx[8].id)) {
    				option.__value = option_value_value;
    			}

    			option.value = option.__value;
    		},
    		d(detaching) {
    			if (detaching) detach(option);
    		}
    	};
    }

    function create_fragment$5(ctx) {
    	let div4;
    	let div0;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let div0_class_value;
    	let t0;
    	let div3;
    	let div2;
    	let div1;
    	let select;
    	let option;
    	let t2;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*items*/ ctx[0];
    	const get_key = ctx => /*item*/ ctx[11].id;

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
    	}

    	let each_value = /*variants*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div4 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t0 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			select = element("select");
    			option = element("option");
    			option.textContent = "Выберите из списка...";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			button = element("button");
    			button.textContent = "Добавить";
    			attr(div0, "class", div0_class_value = "column " + /*classes*/ ctx[2]);
    			option.__value = "-1";
    			option.value = option.__value;
    			option.selected = true;
    			attr(div1, "class", "select is-small");
    			attr(button, "class", "button is-primary is-small");
    			attr(div2, "class", "control");
    			attr(div3, "class", "column");
    			attr(div4, "class", "columns");
    		},
    		m(target, anchor) {
    			insert(target, div4, anchor);
    			append(div4, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append(div4, t0);
    			append(div4, div3);
    			append(div3, div2);
    			append(div2, div1);
    			append(div1, select);
    			append(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			append(div2, t2);
    			append(div2, button);

    			if (!mounted) {
    				dispose = listen(button, "click", /*add*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*items, remove*/ 9) {
    				const each_value_1 = /*items*/ ctx[0];
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, div0, destroy_block, create_each_block_1, null, get_each_context_1);
    			}

    			if (dirty & /*classes*/ 4 && div0_class_value !== (div0_class_value = "column " + /*classes*/ ctx[2])) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (dirty & /*variants*/ 2) {
    				each_value = /*variants*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div4);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let dispatch = createEventDispatcher();
    	let { items = [] } = $$props;
    	let { variants = [] } = $$props;
    	let { error = false } = $$props;

    	let { beforeAdd = (item, list) => {
    		return true;
    	} } = $$props;

    	function remove(e) {
    		e && e.preventDefault();
    		let id = parseInt(e.currentTarget.dataset.id);
    		let item = items.find(el => el.id === id);

    		if (item) {
    			items.splice(items.indexOf(item), 1);
    			$$invalidate(0, items);
    			dispatch("change", items);
    		}

    		return false;
    	}

    	function add(e) {
    		e && e.preventDefault();
    		let id = parseInt(e.currentTarget.parentNode.querySelector("select").value);
    		let item = variants.find(el => el.id === id);

    		if (!beforeAdd(item, items)) {
    			return false;
    		}

    		if (item && items.indexOf(item) === -1) {
    			items.push(item);
    			$$invalidate(0, items);
    			dispatch("change", items);
    		}

    		return false;
    	}

    	$$self.$set = $$props => {
    		if ("items" in $$props) $$invalidate(0, items = $$props.items);
    		if ("variants" in $$props) $$invalidate(1, variants = $$props.variants);
    		if ("error" in $$props) $$invalidate(5, error = $$props.error);
    		if ("beforeAdd" in $$props) $$invalidate(6, beforeAdd = $$props.beforeAdd);
    	};

    	let classes;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*error*/ 32) {
    			 $$invalidate(2, classes = error ? "is-danger" : "");
    		}
    	};

    	return [items, variants, classes, remove, add, error, beforeAdd];
    }

    class Ui_tag extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			items: 0,
    			variants: 1,
    			error: 5,
    			beforeAdd: 6
    		});
    	}
    }

    /* src/ui.booleans.svelte generated by Svelte v3.23.2 */

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (10:0) {:else}
    function create_else_block$2(ctx) {
    	let span;
    	let t;

    	return {
    		c() {
    			span = element("span");
    			t = text(/*NO*/ ctx[1]);
    			attr(span, "class", "tag is-danger");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*NO*/ 2) set_data(t, /*NO*/ ctx[1]);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (8:0) {#if item.value }
    function create_if_block$3(ctx) {
    	let span;
    	let t;

    	return {
    		c() {
    			span = element("span");
    			t = text(/*YES*/ ctx[0]);
    			attr(span, "class", "tag is-success");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*YES*/ 1) set_data(t, /*YES*/ ctx[0]);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (7:0) {#each values as item }
    function create_each_block$4(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[3].value) return create_if_block$3;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function create_fragment$6(ctx) {
    	let each_1_anchor;
    	let each_value = /*values*/ ctx[2];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*YES, values, NO*/ 7) {
    				each_value = /*values*/ ctx[2];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { YES = "Да" } = $$props;
    	let { NO = "Нет" } = $$props;
    	let { values = [] } = $$props;

    	$$self.$set = $$props => {
    		if ("YES" in $$props) $$invalidate(0, YES = $$props.YES);
    		if ("NO" in $$props) $$invalidate(1, NO = $$props.NO);
    		if ("values" in $$props) $$invalidate(2, values = $$props.values);
    	};

    	return [YES, NO, values];
    }

    class Ui_booleans extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { YES: 0, NO: 1, values: 2 });
    	}
    }

    /* src/ui.button.svelte generated by Svelte v3.23.2 */

    function create_fragment$7(ctx) {
    	let button;
    	let t;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			t = text(/*title*/ ctx[0]);
    			attr(button, "class", button_class_value = "button " + /*classes*/ ctx[2]);
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t);

    			if (!mounted) {
    				dispose = listen(button, "click", function () {
    					if (is_function(/*action*/ ctx[1])) /*action*/ ctx[1].apply(this, arguments);
    				});

    				mounted = true;
    			}
    		},
    		p(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*title*/ 1) set_data(t, /*title*/ ctx[0]);

    			if (dirty & /*classes*/ 4 && button_class_value !== (button_class_value = "button " + /*classes*/ ctx[2])) {
    				attr(button, "class", button_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { state = "" } = $$props;
    	let { title = "" } = $$props;
    	let { light = false } = $$props;
    	let { type = "" } = $$props;
    	let { size = "" } = $$props;

    	let { action = () => {
    		return true;
    	} } = $$props;

    	$$self.$set = $$props => {
    		if ("state" in $$props) $$invalidate(3, state = $$props.state);
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("light" in $$props) $$invalidate(4, light = $$props.light);
    		if ("type" in $$props) $$invalidate(5, type = $$props.type);
    		if ("size" in $$props) $$invalidate(6, size = $$props.size);
    		if ("action" in $$props) $$invalidate(1, action = $$props.action);
    	};

    	let classes;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*state, light, type, size*/ 120) {
    			 $$invalidate(2, classes = (state && state.length > 0 ? ` is-${state} ` : "") + (light ? ` is-light ` : "") + (type && type.length > 0 ? ` is-${type} ` : "") + (size && size.length > 0 ? ` is-${size} ` : ""));
    		}
    	};

    	return [title, action, classes, state, light, type, size];
    }

    class Ui_button extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			state: 3,
    			title: 0,
    			light: 4,
    			type: 5,
    			size: 6,
    			action: 1
    		});
    	}
    }

    /* src/ui.buttons.svelte generated by Svelte v3.23.2 */

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (7:2) {#each values as item (item) }
    function create_each_block$5(key_1, ctx) {
    	let first;
    	let uibutton;
    	let current;
    	const uibutton_spread_levels = [/*item*/ ctx[1]];
    	let uibutton_props = {};

    	for (let i = 0; i < uibutton_spread_levels.length; i += 1) {
    		uibutton_props = assign(uibutton_props, uibutton_spread_levels[i]);
    	}

    	uibutton = new Ui_button({ props: uibutton_props });

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			create_component(uibutton.$$.fragment);
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(uibutton, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uibutton_changes = (dirty & /*values*/ 1)
    			? get_spread_update(uibutton_spread_levels, [get_spread_object(/*item*/ ctx[1])])
    			: {};

    			uibutton.$set(uibutton_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uibutton.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uibutton.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(first);
    			destroy_component(uibutton, detaching);
    		}
    	};
    }

    function create_fragment$8(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*values*/ ctx[0];
    	const get_key = ctx => /*item*/ ctx[1];

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$5(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$5(key, child_ctx));
    	}

    	return {
    		c() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div, "class", "buttons has-addons");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*values*/ 1) {
    				const each_value = /*values*/ ctx[0];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$5, null, get_each_context$5);
    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { values = [] } = $$props;

    	$$self.$set = $$props => {
    		if ("values" in $$props) $$invalidate(0, values = $$props.values);
    	};

    	return [values];
    }

    class Ui_buttons extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { values: 0 });
    	}
    }

    /* src/ui.images.svelte generated by Svelte v3.23.2 */

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (5:0) {#each values as item (item.url) }
    function create_each_block$6(key_1, ctx) {
    	let figure;
    	let img;
    	let img_alt_value;
    	let img_src_value;
    	let t;

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			figure = element("figure");
    			img = element("img");
    			t = space();
    			attr(img, "class", "is-rounded");
    			attr(img, "alt", img_alt_value = /*item*/ ctx[1].title);
    			if (img.src !== (img_src_value = /*item*/ ctx[1].url)) attr(img, "src", img_src_value);
    			attr(figure, "class", "image is-64x64");
    			this.first = figure;
    		},
    		m(target, anchor) {
    			insert(target, figure, anchor);
    			append(figure, img);
    			append(figure, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*values*/ 1 && img_alt_value !== (img_alt_value = /*item*/ ctx[1].title)) {
    				attr(img, "alt", img_alt_value);
    			}

    			if (dirty & /*values*/ 1 && img.src !== (img_src_value = /*item*/ ctx[1].url)) {
    				attr(img, "src", img_src_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(figure);
    		}
    	};
    }

    function create_fragment$9(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value = /*values*/ ctx[0];
    	const get_key = ctx => /*item*/ ctx[1].url;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$6(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$6(key, child_ctx));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*values*/ 1) {
    				const each_value = /*values*/ ctx[0];
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block$6, each_1_anchor, get_each_context$6);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { values = [] } = $$props;

    	$$self.$set = $$props => {
    		if ("values" in $$props) $$invalidate(0, values = $$props.values);
    	};

    	return [values];
    }

    class Ui_images extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { values: 0 });
    	}
    }

    /* src/ui.link.svelte generated by Svelte v3.23.2 */

    function create_fragment$a(ctx) {
    	let a;
    	let t;
    	let a_class_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			a = element("a");
    			t = text(/*title*/ ctx[1]);
    			attr(a, "href", /*url*/ ctx[0]);
    			attr(a, "class", a_class_value = "button " + /*classes*/ ctx[3]);
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);
    			append(a, t);

    			if (!mounted) {
    				dispose = listen(a, "click", function () {
    					if (is_function(/*action*/ ctx[2])) /*action*/ ctx[2].apply(this, arguments);
    				});

    				mounted = true;
    			}
    		},
    		p(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*title*/ 2) set_data(t, /*title*/ ctx[1]);

    			if (dirty & /*url*/ 1) {
    				attr(a, "href", /*url*/ ctx[0]);
    			}

    			if (dirty & /*classes*/ 8 && a_class_value !== (a_class_value = "button " + /*classes*/ ctx[3])) {
    				attr(a, "class", a_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(a);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let classes;
    	let { url = "" } = $$props;
    	let { state = "" } = $$props;
    	let { title = "" } = $$props;
    	let { light = false } = $$props;
    	let { type = "" } = $$props;
    	let { size = "" } = $$props;

    	let { action = () => {
    		return true;
    	} } = $$props;

    	

    	$$self.$set = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    		if ("state" in $$props) $$invalidate(4, state = $$props.state);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("light" in $$props) $$invalidate(5, light = $$props.light);
    		if ("type" in $$props) $$invalidate(6, type = $$props.type);
    		if ("size" in $$props) $$invalidate(7, size = $$props.size);
    		if ("action" in $$props) $$invalidate(2, action = $$props.action);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*state, light, type, size*/ 240) {
    			 {
    				$$invalidate(3, classes = (state && state.length > 0 ? ` is-${state} ` : "") + (light ? ` is-light ` : "") + (type && type.length > 0 ? ` is-${type} ` : "") + (size && size.length > 0 ? ` is-${size} ` : ""));
    			}
    		}
    	};

    	return [url, title, action, classes, state, light, type, size];
    }

    class Ui_link extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			url: 0,
    			state: 4,
    			title: 1,
    			light: 5,
    			type: 6,
    			size: 7,
    			action: 2
    		});
    	}
    }

    /* src/ui.links.svelte generated by Svelte v3.23.2 */

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (8:4) {#each values as item (item) }
    function create_each_block$7(key_1, ctx) {
    	let first;
    	let uilink;
    	let current;
    	const uilink_spread_levels = [/*item*/ ctx[1]];
    	let uilink_props = {};

    	for (let i = 0; i < uilink_spread_levels.length; i += 1) {
    		uilink_props = assign(uilink_props, uilink_spread_levels[i]);
    	}

    	uilink = new Ui_link({ props: uilink_props });

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			create_component(uilink.$$.fragment);
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(uilink, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const uilink_changes = (dirty & /*values*/ 1)
    			? get_spread_update(uilink_spread_levels, [get_spread_object(/*item*/ ctx[1])])
    			: {};

    			uilink.$set(uilink_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(uilink.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(uilink.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(first);
    			destroy_component(uilink, detaching);
    		}
    	};
    }

    function create_fragment$b(ctx) {
    	let div;
    	let p;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*values*/ ctx[0];
    	const get_key = ctx => /*item*/ ctx[1];

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$7(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$7(key, child_ctx));
    	}

    	return {
    		c() {
    			div = element("div");
    			p = element("p");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(p, "class", "control");
    			attr(div, "class", "field has-addons");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, p);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(p, null);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*values*/ 1) {
    				const each_value = /*values*/ ctx[0];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, p, outro_and_destroy_block, create_each_block$7, null, get_each_context$7);
    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { values = [] } = $$props;

    	$$self.$set = $$props => {
    		if ("values" in $$props) $$invalidate(0, values = $$props.values);
    	};

    	return [values];
    }

    class Ui_links extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { values: 0 });
    	}
    }

    var CLASS_ERR = 'is-danger';
    var CLASS_OK = 'is-success';

    /* src/form/ui.checkbox.svelte generated by Svelte v3.23.2 */

    function create_else_block$3(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(" ");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (72:4) {#if !(validated && valid) && (inputStarted) }
    function create_if_block$4(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*helper*/ ctx[11]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*helper*/ 2048) set_data(t, /*helper*/ ctx[11]);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$c(ctx) {
    	let div1;
    	let label0;
    	let t0;
    	let t1;
    	let div0;
    	let label1;
    	let input;
    	let input_id_value;
    	let input_aria_controls_value;
    	let input_aria_describedby_value;
    	let t2;
    	let t3;
    	let label1_for_value;
    	let div0_class_value;
    	let t4;
    	let p;
    	let p_class_value;
    	let p_id_value;
    	let div1_class_value;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (!(/*validated*/ ctx[9] && /*valid*/ ctx[8]) && /*inputStarted*/ ctx[0]) return create_if_block$4;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			label0 = element("label");
    			t0 = text(/*label*/ ctx[2]);
    			t1 = space();
    			div0 = element("div");
    			label1 = element("label");
    			input = element("input");
    			t2 = space();
    			t3 = text(/*label*/ ctx[2]);
    			t4 = space();
    			p = element("p");
    			if_block.c();
    			attr(label0, "class", "label");
    			attr(input, "type", "checkbox");
    			attr(input, "id", input_id_value = "edit-form-checkbox-" + /*fieldname*/ ctx[4]);
    			attr(input, "placeholder", /*placeholder*/ ctx[3]);
    			attr(input, "name", /*fieldname*/ ctx[4]);
    			input.required = /*required*/ ctx[5];
    			input.readOnly = /*readonly*/ ctx[6];
    			attr(input, "invalid", /*invalid*/ ctx[12]);
    			attr(input, "aria-controls", input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			attr(input, "aria-describedby", input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			input.disabled = /*disabled*/ ctx[7];
    			attr(label1, "class", "checkbox");
    			attr(label1, "disabled", /*disabled*/ ctx[7]);
    			attr(label1, "for", label1_for_value = "edit-form-checkbox-" + /*fieldname*/ ctx[4]);
    			attr(div0, "class", div0_class_value = "control " + /*iconClasses*/ ctx[10]);
    			attr(p, "class", p_class_value = "help " + /*validationClasses*/ ctx[13]);
    			attr(p, "id", p_id_value = "form-field-helper-" + /*fieldname*/ ctx[4]);
    			attr(div1, "class", div1_class_value = "field form-field-checkbox-" + /*fieldname*/ ctx[4]);
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, label0);
    			append(label0, t0);
    			append(div1, t1);
    			append(div1, div0);
    			append(div0, label1);
    			append(label1, input);
    			input.checked = /*value*/ ctx[1];
    			append(label1, t2);
    			append(label1, t3);
    			append(div1, t4);
    			append(div1, p);
    			if_block.m(p, null);

    			if (!mounted) {
    				dispose = [
    					listen(input, "change", /*input_change_handler*/ ctx[21]),
    					listen(input, "change", /*onBlur*/ ctx[14]),
    					listen(input, "input", /*onInput*/ ctx[15])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*label*/ 4) set_data(t0, /*label*/ ctx[2]);

    			if (dirty & /*fieldname*/ 16 && input_id_value !== (input_id_value = "edit-form-checkbox-" + /*fieldname*/ ctx[4])) {
    				attr(input, "id", input_id_value);
    			}

    			if (dirty & /*placeholder*/ 8) {
    				attr(input, "placeholder", /*placeholder*/ ctx[3]);
    			}

    			if (dirty & /*fieldname*/ 16) {
    				attr(input, "name", /*fieldname*/ ctx[4]);
    			}

    			if (dirty & /*required*/ 32) {
    				input.required = /*required*/ ctx[5];
    			}

    			if (dirty & /*readonly*/ 64) {
    				input.readOnly = /*readonly*/ ctx[6];
    			}

    			if (dirty & /*invalid*/ 4096) {
    				attr(input, "invalid", /*invalid*/ ctx[12]);
    			}

    			if (dirty & /*fieldname*/ 16 && input_aria_controls_value !== (input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(input, "aria-controls", input_aria_controls_value);
    			}

    			if (dirty & /*fieldname*/ 16 && input_aria_describedby_value !== (input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(input, "aria-describedby", input_aria_describedby_value);
    			}

    			if (dirty & /*disabled*/ 128) {
    				input.disabled = /*disabled*/ ctx[7];
    			}

    			if (dirty & /*value*/ 2) {
    				input.checked = /*value*/ ctx[1];
    			}

    			if (dirty & /*label*/ 4) set_data(t3, /*label*/ ctx[2]);

    			if (dirty & /*disabled*/ 128) {
    				attr(label1, "disabled", /*disabled*/ ctx[7]);
    			}

    			if (dirty & /*fieldname*/ 16 && label1_for_value !== (label1_for_value = "edit-form-checkbox-" + /*fieldname*/ ctx[4])) {
    				attr(label1, "for", label1_for_value);
    			}

    			if (dirty & /*iconClasses*/ 1024 && div0_class_value !== (div0_class_value = "control " + /*iconClasses*/ ctx[10])) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(p, null);
    				}
    			}

    			if (dirty & /*validationClasses*/ 8192 && p_class_value !== (p_class_value = "help " + /*validationClasses*/ ctx[13])) {
    				attr(p, "class", p_class_value);
    			}

    			if (dirty & /*fieldname*/ 16 && p_id_value !== (p_id_value = "form-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(p, "id", p_id_value);
    			}

    			if (dirty & /*fieldname*/ 16 && div1_class_value !== (div1_class_value = "field form-field-checkbox-" + /*fieldname*/ ctx[4])) {
    				attr(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div1);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let dispatch = createEventDispatcher();
    	let { inputStarted = false } = $$props;

    	let { validator = () => {
    		return true;
    	} } = $$props;

    	let { value = "" } = $$props;
    	let { label = "textfield" } = $$props;
    	let { placeholder = "input some text here, please" } = $$props;
    	let { fieldname = "textfield" } = $$props;
    	let { icon = false } = $$props;
    	let { required = true } = $$props;
    	let { readonly = false } = $$props;
    	let { disabled = false } = $$props;
    	let { valid = true } = $$props;
    	let { validated = false } = $$props;
    	let { errors = false } = $$props;
    	let { formErrors = false } = $$props;
    	let { formLevelError = false } = $$props;

    	function onBlur(ev) {
    		let data = {
    			field: fieldname,
    			value: ev.target.type === "checkbox"
    			? ev.target.checked
    			: ev.target.value
    		};

    		$$invalidate(0, inputStarted = true);
    		dispatch("change", data);
    		return true;
    	}

    	function onInput(ev) {
    		let data = { field: fieldname, value };
    		$$invalidate(0, inputStarted = true);
    		dispatch("change", data);
    		return true;
    	}

    	function input_change_handler() {
    		value = this.checked;
    		$$invalidate(1, value);
    	}

    	$$self.$set = $$props => {
    		if ("inputStarted" in $$props) $$invalidate(0, inputStarted = $$props.inputStarted);
    		if ("validator" in $$props) $$invalidate(16, validator = $$props.validator);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("label" in $$props) $$invalidate(2, label = $$props.label);
    		if ("placeholder" in $$props) $$invalidate(3, placeholder = $$props.placeholder);
    		if ("fieldname" in $$props) $$invalidate(4, fieldname = $$props.fieldname);
    		if ("icon" in $$props) $$invalidate(17, icon = $$props.icon);
    		if ("required" in $$props) $$invalidate(5, required = $$props.required);
    		if ("readonly" in $$props) $$invalidate(6, readonly = $$props.readonly);
    		if ("disabled" in $$props) $$invalidate(7, disabled = $$props.disabled);
    		if ("valid" in $$props) $$invalidate(8, valid = $$props.valid);
    		if ("validated" in $$props) $$invalidate(9, validated = $$props.validated);
    		if ("errors" in $$props) $$invalidate(18, errors = $$props.errors);
    		if ("formErrors" in $$props) $$invalidate(19, formErrors = $$props.formErrors);
    		if ("formLevelError" in $$props) $$invalidate(20, formLevelError = $$props.formLevelError);
    	};

    	let iconClasses;
    	let allErrors;
    	let helper;
    	let invalid;
    	let validationClasses;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 131072) {
    			 $$invalidate(10, iconClasses = (icon ? " has-icons-left " : "") + " has-icons-right ");
    		}

    		if ($$self.$$.dirty & /*errors, formErrors*/ 786432) {
    			 $$invalidate(22, allErrors = [].concat(errors ? errors : [], formErrors ? formErrors : []));
    		}

    		if ($$self.$$.dirty & /*allErrors, placeholder*/ 4194312) {
    			 $$invalidate(11, helper = allErrors ? allErrors.join(", ") : placeholder);
    		}

    		if ($$self.$$.dirty & /*valid, formLevelError*/ 1048832) {
    			 $$invalidate(12, invalid = valid === false || formLevelError);
    		}

    		if ($$self.$$.dirty & /*valid, inputStarted*/ 257) {
    			 $$invalidate(13, validationClasses = valid === true || !inputStarted ? CLASS_OK : CLASS_ERR);
    		}
    	};

    	return [
    		inputStarted,
    		value,
    		label,
    		placeholder,
    		fieldname,
    		required,
    		readonly,
    		disabled,
    		valid,
    		validated,
    		iconClasses,
    		helper,
    		invalid,
    		validationClasses,
    		onBlur,
    		onInput,
    		validator,
    		icon,
    		errors,
    		formErrors,
    		formLevelError,
    		input_change_handler
    	];
    }

    class Ui_checkbox extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
    			inputStarted: 0,
    			validator: 16,
    			value: 1,
    			label: 2,
    			placeholder: 3,
    			fieldname: 4,
    			icon: 17,
    			required: 5,
    			readonly: 6,
    			disabled: 7,
    			valid: 8,
    			validated: 9,
    			errors: 18,
    			formErrors: 19,
    			formLevelError: 20
    		});
    	}
    }

    /* src/form/ui.color.svelte generated by Svelte v3.23.2 */

    function create_if_block_4(ctx) {
    	let span;
    	let i;
    	let i_class_value;

    	return {
    		c() {
    			span = element("span");
    			i = element("i");
    			attr(i, "class", i_class_value = "fas fa-" + /*icon*/ ctx[5]);
    			attr(span, "class", "icon is-small is-left");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, i);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*icon*/ 32 && i_class_value !== (i_class_value = "fas fa-" + /*icon*/ ctx[5])) {
    				attr(i, "class", i_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (59:4) {#if validated === true }
    function create_if_block_1$2(ctx) {
    	let span;

    	function select_block_type(ctx, dirty) {
    		if (/*valid*/ ctx[8] === true) return create_if_block_2$1;
    		if (/*valid*/ ctx[8] === false) return create_if_block_3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	return {
    		c() {
    			span = element("span");
    			if (if_block) if_block.c();
    			attr(span, "class", "icon is-small is-right");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			if (if_block) if_block.m(span, null);
    		},
    		p(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span, null);
    				}
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};
    }

    // (63:35) 
    function create_if_block_3(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-exclamation-triangle");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (61:6) {#if valid === true }
    function create_if_block_2$1(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-check");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (72:4) {:else}
    function create_else_block$4(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(" ");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (70:4) {#if !(validated && valid) && (inputStarted) }
    function create_if_block$5(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*helper*/ ctx[11]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*helper*/ 2048) set_data(t, /*helper*/ ctx[11]);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$d(ctx) {
    	let div1;
    	let label_1;
    	let t0;
    	let t1;
    	let div0;
    	let input;
    	let input_class_value;
    	let input_aria_controls_value;
    	let input_aria_describedby_value;
    	let t2;
    	let t3;
    	let div0_class_value;
    	let t4;
    	let p;
    	let p_class_value;
    	let p_id_value;
    	let div1_class_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*icon*/ ctx[5] && create_if_block_4(ctx);
    	let if_block1 = /*validated*/ ctx[9] === true && create_if_block_1$2(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (!(/*validated*/ ctx[9] && /*valid*/ ctx[8]) && /*inputStarted*/ ctx[0]) return create_if_block$5;
    		return create_else_block$4;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block2 = current_block_type(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			label_1 = element("label");
    			t0 = text(/*label*/ ctx[2]);
    			t1 = space();
    			div0 = element("div");
    			input = element("input");
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			p = element("p");
    			if_block2.c();
    			attr(label_1, "class", "label");
    			attr(input, "class", input_class_value = "input " + /*validationClasses*/ ctx[13]);
    			attr(input, "type", "color");
    			attr(input, "name", /*fieldname*/ ctx[4]);
    			attr(input, "invalid", /*invalid*/ ctx[12]);
    			input.required = /*required*/ ctx[6];
    			attr(input, "placeholder", /*placeholder*/ ctx[3]);
    			attr(input, "autocomplete", /*fieldname*/ ctx[4]);
    			attr(input, "aria-controls", input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			input.readOnly = /*readonly*/ ctx[7];
    			attr(input, "aria-describedby", input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			attr(div0, "class", div0_class_value = "control " + /*iconClasses*/ ctx[10]);
    			attr(p, "class", p_class_value = "help " + /*validationClasses*/ ctx[13]);
    			attr(p, "id", p_id_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			attr(div1, "class", div1_class_value = "field form-field-color-" + /*fieldname*/ ctx[4]);
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, label_1);
    			append(label_1, t0);
    			append(div1, t1);
    			append(div1, div0);
    			append(div0, input);
    			set_input_value(input, /*value*/ ctx[1]);
    			append(div0, t2);
    			if (if_block0) if_block0.m(div0, null);
    			append(div0, t3);
    			if (if_block1) if_block1.m(div0, null);
    			append(div1, t4);
    			append(div1, p);
    			if_block2.m(p, null);

    			if (!mounted) {
    				dispose = [
    					listen(input, "input", /*input_input_handler*/ ctx[20]),
    					listen(input, "change", /*onBlur*/ ctx[14]),
    					listen(input, "input", /*onInput*/ ctx[15])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*label*/ 4) set_data(t0, /*label*/ ctx[2]);

    			if (dirty & /*validationClasses*/ 8192 && input_class_value !== (input_class_value = "input " + /*validationClasses*/ ctx[13])) {
    				attr(input, "class", input_class_value);
    			}

    			if (dirty & /*fieldname*/ 16) {
    				attr(input, "name", /*fieldname*/ ctx[4]);
    			}

    			if (dirty & /*invalid*/ 4096) {
    				attr(input, "invalid", /*invalid*/ ctx[12]);
    			}

    			if (dirty & /*required*/ 64) {
    				input.required = /*required*/ ctx[6];
    			}

    			if (dirty & /*placeholder*/ 8) {
    				attr(input, "placeholder", /*placeholder*/ ctx[3]);
    			}

    			if (dirty & /*fieldname*/ 16) {
    				attr(input, "autocomplete", /*fieldname*/ ctx[4]);
    			}

    			if (dirty & /*fieldname*/ 16 && input_aria_controls_value !== (input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(input, "aria-controls", input_aria_controls_value);
    			}

    			if (dirty & /*readonly*/ 128) {
    				input.readOnly = /*readonly*/ ctx[7];
    			}

    			if (dirty & /*fieldname*/ 16 && input_aria_describedby_value !== (input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(input, "aria-describedby", input_aria_describedby_value);
    			}

    			if (dirty & /*value*/ 2) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}

    			if (/*icon*/ ctx[5]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(div0, t3);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*validated*/ ctx[9] === true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$2(ctx);
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*iconClasses*/ 1024 && div0_class_value !== (div0_class_value = "control " + /*iconClasses*/ ctx[10])) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(p, null);
    				}
    			}

    			if (dirty & /*validationClasses*/ 8192 && p_class_value !== (p_class_value = "help " + /*validationClasses*/ ctx[13])) {
    				attr(p, "class", p_class_value);
    			}

    			if (dirty & /*fieldname*/ 16 && p_id_value !== (p_id_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(p, "id", p_id_value);
    			}

    			if (dirty & /*fieldname*/ 16 && div1_class_value !== (div1_class_value = "field form-field-color-" + /*fieldname*/ ctx[4])) {
    				attr(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let dispatch = createEventDispatcher();
    	let { inputStarted = false } = $$props;

    	let { validator = () => {
    		return true;
    	} } = $$props;

    	let { value = "" } = $$props;
    	let { label = "Colour" } = $$props;
    	let { placeholder = "Select you favorite color" } = $$props;
    	let { fieldname = "color" } = $$props;
    	let { icon = false } = $$props;
    	let { required = true } = $$props;
    	let { readonly = false } = $$props;
    	let { valid = true } = $$props;
    	let { validated = false } = $$props;
    	let { errors = false } = $$props;
    	let { formErrors = false } = $$props;
    	let { formLevelError = false } = $$props;

    	function onBlur(ev) {
    		let data = {
    			field: fieldname,
    			value: ev.target.type === "checkbox"
    			? ev.target.checked
    			: ev.target.value
    		};

    		$$invalidate(0, inputStarted = true);
    		dispatch("change", data);
    		return true;
    	}

    	function onInput(ev) {
    		let data = { field: fieldname, value };
    		$$invalidate(0, inputStarted = true);
    		dispatch("change", data);
    		return true;
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	$$self.$set = $$props => {
    		if ("inputStarted" in $$props) $$invalidate(0, inputStarted = $$props.inputStarted);
    		if ("validator" in $$props) $$invalidate(16, validator = $$props.validator);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("label" in $$props) $$invalidate(2, label = $$props.label);
    		if ("placeholder" in $$props) $$invalidate(3, placeholder = $$props.placeholder);
    		if ("fieldname" in $$props) $$invalidate(4, fieldname = $$props.fieldname);
    		if ("icon" in $$props) $$invalidate(5, icon = $$props.icon);
    		if ("required" in $$props) $$invalidate(6, required = $$props.required);
    		if ("readonly" in $$props) $$invalidate(7, readonly = $$props.readonly);
    		if ("valid" in $$props) $$invalidate(8, valid = $$props.valid);
    		if ("validated" in $$props) $$invalidate(9, validated = $$props.validated);
    		if ("errors" in $$props) $$invalidate(17, errors = $$props.errors);
    		if ("formErrors" in $$props) $$invalidate(18, formErrors = $$props.formErrors);
    		if ("formLevelError" in $$props) $$invalidate(19, formLevelError = $$props.formLevelError);
    	};

    	let iconClasses;
    	let allErrors;
    	let helper;
    	let invalid;
    	let validationClasses;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 32) {
    			 $$invalidate(10, iconClasses = (icon ? " has-icons-left " : "") + " has-icons-right ");
    		}

    		if ($$self.$$.dirty & /*errors, formErrors*/ 393216) {
    			 $$invalidate(21, allErrors = [].concat(errors ? errors : [], formErrors ? formErrors : []));
    		}

    		if ($$self.$$.dirty & /*allErrors, placeholder*/ 2097160) {
    			 $$invalidate(11, helper = allErrors ? allErrors.join(", ") : placeholder);
    		}

    		if ($$self.$$.dirty & /*valid, formLevelError*/ 524544) {
    			 $$invalidate(12, invalid = valid === false || formLevelError);
    		}

    		if ($$self.$$.dirty & /*valid, inputStarted*/ 257) {
    			 $$invalidate(13, validationClasses = valid === true || !inputStarted ? CLASS_OK : CLASS_ERR);
    		}
    	};

    	return [
    		inputStarted,
    		value,
    		label,
    		placeholder,
    		fieldname,
    		icon,
    		required,
    		readonly,
    		valid,
    		validated,
    		iconClasses,
    		helper,
    		invalid,
    		validationClasses,
    		onBlur,
    		onInput,
    		validator,
    		errors,
    		formErrors,
    		formLevelError,
    		input_input_handler
    	];
    }

    class Ui_color extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			inputStarted: 0,
    			validator: 16,
    			value: 1,
    			label: 2,
    			placeholder: 3,
    			fieldname: 4,
    			icon: 5,
    			required: 6,
    			readonly: 7,
    			valid: 8,
    			validated: 9,
    			errors: 17,
    			formErrors: 18,
    			formLevelError: 19
    		});
    	}
    }

    /* src/form/ui.date.svelte generated by Svelte v3.23.2 */

    function create_if_block_4$1(ctx) {
    	let span;
    	let i;
    	let i_class_value;

    	return {
    		c() {
    			span = element("span");
    			i = element("i");
    			attr(i, "class", i_class_value = "fas fa-" + /*icon*/ ctx[5]);
    			attr(span, "class", "icon is-small is-left");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, i);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*icon*/ 32 && i_class_value !== (i_class_value = "fas fa-" + /*icon*/ ctx[5])) {
    				attr(i, "class", i_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (63:4) {#if validated === true }
    function create_if_block_1$3(ctx) {
    	let span;

    	function select_block_type(ctx, dirty) {
    		if (/*valid*/ ctx[8] === true) return create_if_block_2$2;
    		if (/*valid*/ ctx[8] === false) return create_if_block_3$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	return {
    		c() {
    			span = element("span");
    			if (if_block) if_block.c();
    			attr(span, "class", "icon is-small is-right");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			if (if_block) if_block.m(span, null);
    		},
    		p(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span, null);
    				}
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};
    }

    // (67:35) 
    function create_if_block_3$1(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-exclamation-triangle");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (65:6) {#if valid === true }
    function create_if_block_2$2(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-check");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (76:4) {:else}
    function create_else_block$5(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(" ");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (74:4) {#if !(validated && valid) && (inputStarted) }
    function create_if_block$6(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*helper*/ ctx[11]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*helper*/ 2048) set_data(t, /*helper*/ ctx[11]);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$e(ctx) {
    	let div1;
    	let label_1;
    	let t0;
    	let t1;
    	let div0;
    	let input;
    	let input_class_value;
    	let input_aria_controls_value;
    	let input_aria_describedby_value;
    	let t2;
    	let t3;
    	let div0_class_value;
    	let t4;
    	let p;
    	let p_class_value;
    	let p_id_value;
    	let div1_class_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*icon*/ ctx[5] && create_if_block_4$1(ctx);
    	let if_block1 = /*validated*/ ctx[9] === true && create_if_block_1$3(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (!(/*validated*/ ctx[9] && /*valid*/ ctx[8]) && /*inputStarted*/ ctx[0]) return create_if_block$6;
    		return create_else_block$5;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block2 = current_block_type(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			label_1 = element("label");
    			t0 = text(/*label*/ ctx[2]);
    			t1 = space();
    			div0 = element("div");
    			input = element("input");
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			p = element("p");
    			if_block2.c();
    			attr(label_1, "class", "label");
    			attr(input, "class", input_class_value = "input " + /*validationClasses*/ ctx[13]);
    			attr(input, "type", "date");
    			attr(input, "name", /*fieldname*/ ctx[4]);
    			attr(input, "invalid", /*invalid*/ ctx[12]);
    			input.required = /*required*/ ctx[6];
    			attr(input, "placeholder", /*placeholder*/ ctx[3]);
    			input.readOnly = /*readonly*/ ctx[7];
    			attr(input, "autocomplete", /*fieldname*/ ctx[4]);
    			attr(input, "aria-controls", input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			attr(input, "aria-describedby", input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			attr(div0, "class", div0_class_value = "control " + /*iconClasses*/ ctx[10]);
    			attr(p, "class", p_class_value = "help " + /*validationClasses*/ ctx[13]);
    			attr(p, "id", p_id_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			attr(div1, "class", div1_class_value = "field form-field-date-" + /*fieldname*/ ctx[4]);
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, label_1);
    			append(label_1, t0);
    			append(div1, t1);
    			append(div1, div0);
    			append(div0, input);
    			set_input_value(input, /*value*/ ctx[1]);
    			append(div0, t2);
    			if (if_block0) if_block0.m(div0, null);
    			append(div0, t3);
    			if (if_block1) if_block1.m(div0, null);
    			append(div1, t4);
    			append(div1, p);
    			if_block2.m(p, null);

    			if (!mounted) {
    				dispose = [
    					listen(input, "input", /*input_input_handler*/ ctx[20]),
    					listen(input, "change", /*onBlur*/ ctx[14]),
    					listen(input, "input", /*onInput*/ ctx[15])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*label*/ 4) set_data(t0, /*label*/ ctx[2]);

    			if (dirty & /*validationClasses*/ 8192 && input_class_value !== (input_class_value = "input " + /*validationClasses*/ ctx[13])) {
    				attr(input, "class", input_class_value);
    			}

    			if (dirty & /*fieldname*/ 16) {
    				attr(input, "name", /*fieldname*/ ctx[4]);
    			}

    			if (dirty & /*invalid*/ 4096) {
    				attr(input, "invalid", /*invalid*/ ctx[12]);
    			}

    			if (dirty & /*required*/ 64) {
    				input.required = /*required*/ ctx[6];
    			}

    			if (dirty & /*placeholder*/ 8) {
    				attr(input, "placeholder", /*placeholder*/ ctx[3]);
    			}

    			if (dirty & /*readonly*/ 128) {
    				input.readOnly = /*readonly*/ ctx[7];
    			}

    			if (dirty & /*fieldname*/ 16) {
    				attr(input, "autocomplete", /*fieldname*/ ctx[4]);
    			}

    			if (dirty & /*fieldname*/ 16 && input_aria_controls_value !== (input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(input, "aria-controls", input_aria_controls_value);
    			}

    			if (dirty & /*fieldname*/ 16 && input_aria_describedby_value !== (input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(input, "aria-describedby", input_aria_describedby_value);
    			}

    			if (dirty & /*value*/ 2) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}

    			if (/*icon*/ ctx[5]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4$1(ctx);
    					if_block0.c();
    					if_block0.m(div0, t3);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*validated*/ ctx[9] === true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$3(ctx);
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*iconClasses*/ 1024 && div0_class_value !== (div0_class_value = "control " + /*iconClasses*/ ctx[10])) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(p, null);
    				}
    			}

    			if (dirty & /*validationClasses*/ 8192 && p_class_value !== (p_class_value = "help " + /*validationClasses*/ ctx[13])) {
    				attr(p, "class", p_class_value);
    			}

    			if (dirty & /*fieldname*/ 16 && p_id_value !== (p_id_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(p, "id", p_id_value);
    			}

    			if (dirty & /*fieldname*/ 16 && div1_class_value !== (div1_class_value = "field form-field-date-" + /*fieldname*/ ctx[4])) {
    				attr(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let dispatch = createEventDispatcher();
    	let { inputStarted = false } = $$props;

    	let { validator = () => {
    		return true;
    	} } = $$props;

    	let { value = "" } = $$props;
    	let { label = "Date and time" } = $$props;
    	let { placeholder = "Date and time of event" } = $$props;
    	let { fieldname = "datetime" } = $$props;
    	let { icon = false } = $$props;
    	let { required = true } = $$props;
    	let { readonly = false } = $$props;
    	let { valid = true } = $$props;
    	let { validated = false } = $$props;
    	let { errors = false } = $$props;
    	let { formErrors = false } = $$props;
    	let { formLevelError = false } = $$props;

    	function onBlur(ev) {
    		let data = {
    			field: fieldname,
    			value: ev.target.type === "checkbox"
    			? ev.target.checked
    			: ev.target.value
    		};

    		$$invalidate(0, inputStarted = true);
    		dispatch("change", data);
    		return true;
    	}

    	function onInput(ev) {
    		let data = { field: fieldname, value };
    		$$invalidate(0, inputStarted = true);
    		dispatch("change", data);
    		return true;
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	$$self.$set = $$props => {
    		if ("inputStarted" in $$props) $$invalidate(0, inputStarted = $$props.inputStarted);
    		if ("validator" in $$props) $$invalidate(16, validator = $$props.validator);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("label" in $$props) $$invalidate(2, label = $$props.label);
    		if ("placeholder" in $$props) $$invalidate(3, placeholder = $$props.placeholder);
    		if ("fieldname" in $$props) $$invalidate(4, fieldname = $$props.fieldname);
    		if ("icon" in $$props) $$invalidate(5, icon = $$props.icon);
    		if ("required" in $$props) $$invalidate(6, required = $$props.required);
    		if ("readonly" in $$props) $$invalidate(7, readonly = $$props.readonly);
    		if ("valid" in $$props) $$invalidate(8, valid = $$props.valid);
    		if ("validated" in $$props) $$invalidate(9, validated = $$props.validated);
    		if ("errors" in $$props) $$invalidate(17, errors = $$props.errors);
    		if ("formErrors" in $$props) $$invalidate(18, formErrors = $$props.formErrors);
    		if ("formLevelError" in $$props) $$invalidate(19, formLevelError = $$props.formLevelError);
    	};

    	let iconClasses;
    	let allErrors;
    	let helper;
    	let invalid;
    	let validationClasses;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 32) {
    			 $$invalidate(10, iconClasses = (icon ? " has-icons-left " : "") + " has-icons-right ");
    		}

    		if ($$self.$$.dirty & /*errors, formErrors*/ 393216) {
    			 $$invalidate(21, allErrors = [].concat(errors ? errors : [], formErrors ? formErrors : []));
    		}

    		if ($$self.$$.dirty & /*allErrors, placeholder*/ 2097160) {
    			 $$invalidate(11, helper = allErrors ? allErrors.join(", ") : placeholder);
    		}

    		if ($$self.$$.dirty & /*valid, formLevelError*/ 524544) {
    			 $$invalidate(12, invalid = valid === false || formLevelError);
    		}

    		if ($$self.$$.dirty & /*valid, inputStarted*/ 257) {
    			 $$invalidate(13, validationClasses = valid === true || !inputStarted ? CLASS_OK : CLASS_ERR);
    		}
    	};

    	return [
    		inputStarted,
    		value,
    		label,
    		placeholder,
    		fieldname,
    		icon,
    		required,
    		readonly,
    		valid,
    		validated,
    		iconClasses,
    		helper,
    		invalid,
    		validationClasses,
    		onBlur,
    		onInput,
    		validator,
    		errors,
    		formErrors,
    		formLevelError,
    		input_input_handler
    	];
    }

    class Ui_date extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			inputStarted: 0,
    			validator: 16,
    			value: 1,
    			label: 2,
    			placeholder: 3,
    			fieldname: 4,
    			icon: 5,
    			required: 6,
    			readonly: 7,
    			valid: 8,
    			validated: 9,
    			errors: 17,
    			formErrors: 18,
    			formLevelError: 19
    		});
    	}
    }

    /* src/form/ui.email.svelte generated by Svelte v3.23.2 */

    function create_if_block_4$2(ctx) {
    	let span;
    	let i;
    	let i_class_value;

    	return {
    		c() {
    			span = element("span");
    			i = element("i");
    			attr(i, "class", i_class_value = "fas fa-" + /*icon*/ ctx[5]);
    			attr(span, "class", "icon is-small is-left");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, i);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*icon*/ 32 && i_class_value !== (i_class_value = "fas fa-" + /*icon*/ ctx[5])) {
    				attr(i, "class", i_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (59:4) {#if validated === true }
    function create_if_block_1$4(ctx) {
    	let span;

    	function select_block_type(ctx, dirty) {
    		if (/*valid*/ ctx[8] === true) return create_if_block_2$3;
    		if (/*valid*/ ctx[8] === false) return create_if_block_3$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	return {
    		c() {
    			span = element("span");
    			if (if_block) if_block.c();
    			attr(span, "class", "icon is-small is-right");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			if (if_block) if_block.m(span, null);
    		},
    		p(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span, null);
    				}
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};
    }

    // (63:35) 
    function create_if_block_3$2(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-exclamation-triangle");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (61:6) {#if valid === true }
    function create_if_block_2$3(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-check");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (72:4) {:else}
    function create_else_block$6(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(" ");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (70:4) {#if !(validated && valid) && (inputStarted) }
    function create_if_block$7(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*helper*/ ctx[11]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*helper*/ 2048) set_data(t, /*helper*/ ctx[11]);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$f(ctx) {
    	let div1;
    	let label_1;
    	let t0;
    	let t1;
    	let div0;
    	let input;
    	let input_class_value;
    	let input_aria_controls_value;
    	let input_aria_describedby_value;
    	let t2;
    	let t3;
    	let div0_class_value;
    	let t4;
    	let p;
    	let p_class_value;
    	let p_id_value;
    	let div1_class_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*icon*/ ctx[5] && create_if_block_4$2(ctx);
    	let if_block1 = /*validated*/ ctx[9] === true && create_if_block_1$4(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (!(/*validated*/ ctx[9] && /*valid*/ ctx[8]) && /*inputStarted*/ ctx[0]) return create_if_block$7;
    		return create_else_block$6;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block2 = current_block_type(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			label_1 = element("label");
    			t0 = text(/*label*/ ctx[2]);
    			t1 = space();
    			div0 = element("div");
    			input = element("input");
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			p = element("p");
    			if_block2.c();
    			attr(label_1, "class", "label");
    			attr(input, "class", input_class_value = "input " + /*validationClasses*/ ctx[13]);
    			attr(input, "type", "email");
    			attr(input, "name", /*fieldname*/ ctx[4]);
    			attr(input, "invalid", /*invalid*/ ctx[12]);
    			input.required = /*required*/ ctx[6];
    			attr(input, "placeholder", /*placeholder*/ ctx[3]);
    			attr(input, "autocomplete", /*fieldname*/ ctx[4]);
    			attr(input, "aria-controls", input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			input.readOnly = /*readonly*/ ctx[7];
    			attr(input, "aria-describedby", input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			attr(div0, "class", div0_class_value = "control " + /*iconClasses*/ ctx[10]);
    			attr(p, "class", p_class_value = "help " + /*validationClasses*/ ctx[13]);
    			attr(p, "id", p_id_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			attr(div1, "class", div1_class_value = "field form-field-textfield-" + /*fieldname*/ ctx[4]);
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, label_1);
    			append(label_1, t0);
    			append(div1, t1);
    			append(div1, div0);
    			append(div0, input);
    			set_input_value(input, /*value*/ ctx[1]);
    			append(div0, t2);
    			if (if_block0) if_block0.m(div0, null);
    			append(div0, t3);
    			if (if_block1) if_block1.m(div0, null);
    			append(div1, t4);
    			append(div1, p);
    			if_block2.m(p, null);

    			if (!mounted) {
    				dispose = [
    					listen(input, "input", /*input_input_handler*/ ctx[20]),
    					listen(input, "change", /*onBlur*/ ctx[14]),
    					listen(input, "input", /*onInput*/ ctx[15])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*label*/ 4) set_data(t0, /*label*/ ctx[2]);

    			if (dirty & /*validationClasses*/ 8192 && input_class_value !== (input_class_value = "input " + /*validationClasses*/ ctx[13])) {
    				attr(input, "class", input_class_value);
    			}

    			if (dirty & /*fieldname*/ 16) {
    				attr(input, "name", /*fieldname*/ ctx[4]);
    			}

    			if (dirty & /*invalid*/ 4096) {
    				attr(input, "invalid", /*invalid*/ ctx[12]);
    			}

    			if (dirty & /*required*/ 64) {
    				input.required = /*required*/ ctx[6];
    			}

    			if (dirty & /*placeholder*/ 8) {
    				attr(input, "placeholder", /*placeholder*/ ctx[3]);
    			}

    			if (dirty & /*fieldname*/ 16) {
    				attr(input, "autocomplete", /*fieldname*/ ctx[4]);
    			}

    			if (dirty & /*fieldname*/ 16 && input_aria_controls_value !== (input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(input, "aria-controls", input_aria_controls_value);
    			}

    			if (dirty & /*readonly*/ 128) {
    				input.readOnly = /*readonly*/ ctx[7];
    			}

    			if (dirty & /*fieldname*/ 16 && input_aria_describedby_value !== (input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(input, "aria-describedby", input_aria_describedby_value);
    			}

    			if (dirty & /*value*/ 2 && input.value !== /*value*/ ctx[1]) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}

    			if (/*icon*/ ctx[5]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4$2(ctx);
    					if_block0.c();
    					if_block0.m(div0, t3);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*validated*/ ctx[9] === true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$4(ctx);
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*iconClasses*/ 1024 && div0_class_value !== (div0_class_value = "control " + /*iconClasses*/ ctx[10])) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(p, null);
    				}
    			}

    			if (dirty & /*validationClasses*/ 8192 && p_class_value !== (p_class_value = "help " + /*validationClasses*/ ctx[13])) {
    				attr(p, "class", p_class_value);
    			}

    			if (dirty & /*fieldname*/ 16 && p_id_value !== (p_id_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(p, "id", p_id_value);
    			}

    			if (dirty & /*fieldname*/ 16 && div1_class_value !== (div1_class_value = "field form-field-textfield-" + /*fieldname*/ ctx[4])) {
    				attr(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let dispatch = createEventDispatcher();
    	let { inputStarted = false } = $$props;

    	let { validator = () => {
    		return true;
    	} } = $$props;

    	let { value = "" } = $$props;
    	let { label = "Email" } = $$props;
    	let { placeholder = "" } = $$props;
    	let { fieldname = "email" } = $$props;
    	let { icon = false } = $$props;
    	let { required = true } = $$props;
    	let { readonly = false } = $$props;
    	let { valid = true } = $$props;
    	let { validated = false } = $$props;
    	let { errors = false } = $$props;
    	let { formErrors = false } = $$props;
    	let { formLevelError = false } = $$props;

    	function onBlur(ev) {
    		let data = {
    			field: fieldname,
    			value: ev.target.type === "checkbox"
    			? ev.target.checked
    			: ev.target.value
    		};

    		$$invalidate(0, inputStarted = true);
    		dispatch("change", data);
    		return true;
    	}

    	function onInput(ev) {
    		let data = { field: fieldname, value };
    		$$invalidate(0, inputStarted = true);
    		dispatch("change", data);
    		return true;
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	$$self.$set = $$props => {
    		if ("inputStarted" in $$props) $$invalidate(0, inputStarted = $$props.inputStarted);
    		if ("validator" in $$props) $$invalidate(16, validator = $$props.validator);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("label" in $$props) $$invalidate(2, label = $$props.label);
    		if ("placeholder" in $$props) $$invalidate(3, placeholder = $$props.placeholder);
    		if ("fieldname" in $$props) $$invalidate(4, fieldname = $$props.fieldname);
    		if ("icon" in $$props) $$invalidate(5, icon = $$props.icon);
    		if ("required" in $$props) $$invalidate(6, required = $$props.required);
    		if ("readonly" in $$props) $$invalidate(7, readonly = $$props.readonly);
    		if ("valid" in $$props) $$invalidate(8, valid = $$props.valid);
    		if ("validated" in $$props) $$invalidate(9, validated = $$props.validated);
    		if ("errors" in $$props) $$invalidate(17, errors = $$props.errors);
    		if ("formErrors" in $$props) $$invalidate(18, formErrors = $$props.formErrors);
    		if ("formLevelError" in $$props) $$invalidate(19, formLevelError = $$props.formLevelError);
    	};

    	let iconClasses;
    	let allErrors;
    	let helper;
    	let invalid;
    	let validationClasses;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 32) {
    			 $$invalidate(10, iconClasses = (icon ? " has-icons-left " : "") + " has-icons-right ");
    		}

    		if ($$self.$$.dirty & /*errors, formErrors*/ 393216) {
    			 $$invalidate(21, allErrors = [].concat(errors ? errors : [], formErrors ? formErrors : []));
    		}

    		if ($$self.$$.dirty & /*allErrors, placeholder*/ 2097160) {
    			 $$invalidate(11, helper = allErrors ? allErrors.join(", ") : placeholder);
    		}

    		if ($$self.$$.dirty & /*valid, formLevelError*/ 524544) {
    			 $$invalidate(12, invalid = valid === false || formLevelError);
    		}

    		if ($$self.$$.dirty & /*valid, inputStarted*/ 257) {
    			 $$invalidate(13, validationClasses = valid === true || !inputStarted ? CLASS_OK : CLASS_ERR);
    		}
    	};

    	return [
    		inputStarted,
    		value,
    		label,
    		placeholder,
    		fieldname,
    		icon,
    		required,
    		readonly,
    		valid,
    		validated,
    		iconClasses,
    		helper,
    		invalid,
    		validationClasses,
    		onBlur,
    		onInput,
    		validator,
    		errors,
    		formErrors,
    		formLevelError,
    		input_input_handler
    	];
    }

    class Ui_email extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			inputStarted: 0,
    			validator: 16,
    			value: 1,
    			label: 2,
    			placeholder: 3,
    			fieldname: 4,
    			icon: 5,
    			required: 6,
    			readonly: 7,
    			valid: 8,
    			validated: 9,
    			errors: 17,
    			formErrors: 18,
    			formLevelError: 19
    		});
    	}
    }

    /* src/form/ui.hidden.svelte generated by Svelte v3.23.2 */

    function create_fragment$g(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			input = element("input");
    			attr(input, "type", "hidden");
    			input.readOnly = /*readonly*/ ctx[2];
    			attr(input, "name", /*fieldname*/ ctx[1]);
    		},
    		m(target, anchor) {
    			insert(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen(input, "input", /*input_input_handler*/ ctx[15]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*readonly*/ 4) {
    				input.readOnly = /*readonly*/ ctx[2];
    			}

    			if (dirty & /*fieldname*/ 2) {
    				attr(input, "name", /*fieldname*/ ctx[1]);
    			}

    			if (dirty & /*value*/ 1) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(input);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { inputStarted = false } = $$props;

    	let { validator = () => {
    		return true;
    	} } = $$props;

    	let { value = "" } = $$props;
    	let { label = "hidden" } = $$props;
    	let { placeholder = "input some text here, please" } = $$props;
    	let { fieldname = "hidden" } = $$props;
    	let { icon = false } = $$props;
    	let { rows = 10 } = $$props;
    	let { required = true } = $$props;
    	let { readonly = false } = $$props;
    	let { valid = true } = $$props;
    	let { validated = false } = $$props;
    	let { errors = false } = $$props;
    	let { formErrors = false } = $$props;
    	let { formLevelError = false } = $$props;

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$set = $$props => {
    		if ("inputStarted" in $$props) $$invalidate(3, inputStarted = $$props.inputStarted);
    		if ("validator" in $$props) $$invalidate(4, validator = $$props.validator);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("label" in $$props) $$invalidate(5, label = $$props.label);
    		if ("placeholder" in $$props) $$invalidate(6, placeholder = $$props.placeholder);
    		if ("fieldname" in $$props) $$invalidate(1, fieldname = $$props.fieldname);
    		if ("icon" in $$props) $$invalidate(7, icon = $$props.icon);
    		if ("rows" in $$props) $$invalidate(8, rows = $$props.rows);
    		if ("required" in $$props) $$invalidate(9, required = $$props.required);
    		if ("readonly" in $$props) $$invalidate(2, readonly = $$props.readonly);
    		if ("valid" in $$props) $$invalidate(10, valid = $$props.valid);
    		if ("validated" in $$props) $$invalidate(11, validated = $$props.validated);
    		if ("errors" in $$props) $$invalidate(12, errors = $$props.errors);
    		if ("formErrors" in $$props) $$invalidate(13, formErrors = $$props.formErrors);
    		if ("formLevelError" in $$props) $$invalidate(14, formLevelError = $$props.formLevelError);
    	};

    	return [
    		value,
    		fieldname,
    		readonly,
    		inputStarted,
    		validator,
    		label,
    		placeholder,
    		icon,
    		rows,
    		required,
    		valid,
    		validated,
    		errors,
    		formErrors,
    		formLevelError,
    		input_input_handler
    	];
    }

    class Ui_hidden extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {
    			inputStarted: 3,
    			validator: 4,
    			value: 0,
    			label: 5,
    			placeholder: 6,
    			fieldname: 1,
    			icon: 7,
    			rows: 8,
    			required: 9,
    			readonly: 2,
    			valid: 10,
    			validated: 11,
    			errors: 12,
    			formErrors: 13,
    			formLevelError: 14
    		});
    	}
    }

    /* src/form/ui.password.svelte generated by Svelte v3.23.2 */

    function create_if_block_4$3(ctx) {
    	let span;
    	let i;
    	let i_class_value;

    	return {
    		c() {
    			span = element("span");
    			i = element("i");
    			attr(i, "class", i_class_value = "fas fa-" + /*icon*/ ctx[5]);
    			attr(span, "class", "icon is-small is-left");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, i);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*icon*/ 32 && i_class_value !== (i_class_value = "fas fa-" + /*icon*/ ctx[5])) {
    				attr(i, "class", i_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (60:4) {#if validated === true }
    function create_if_block_1$5(ctx) {
    	let span;

    	function select_block_type(ctx, dirty) {
    		if (/*valid*/ ctx[8] === true) return create_if_block_2$4;
    		if (/*valid*/ ctx[8] === false) return create_if_block_3$3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	return {
    		c() {
    			span = element("span");
    			if (if_block) if_block.c();
    			attr(span, "class", "icon is-small is-right");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			if (if_block) if_block.m(span, null);
    		},
    		p(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span, null);
    				}
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};
    }

    // (64:35) 
    function create_if_block_3$3(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-exclamation-triangle");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (62:6) {#if valid === true }
    function create_if_block_2$4(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-check");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (73:4) {:else}
    function create_else_block$7(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(" ");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (71:4) {#if !(validated && valid) && (inputStarted) }
    function create_if_block$8(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*helper*/ ctx[11]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*helper*/ 2048) set_data(t, /*helper*/ ctx[11]);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$h(ctx) {
    	let div1;
    	let label_1;
    	let t0;
    	let t1;
    	let div0;
    	let input;
    	let input_class_value;
    	let input_aria_controls_value;
    	let input_aria_describedby_value;
    	let t2;
    	let t3;
    	let div0_class_value;
    	let t4;
    	let p;
    	let p_class_value;
    	let p_id_value;
    	let div1_class_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*icon*/ ctx[5] && create_if_block_4$3(ctx);
    	let if_block1 = /*validated*/ ctx[9] === true && create_if_block_1$5(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (!(/*validated*/ ctx[9] && /*valid*/ ctx[8]) && /*inputStarted*/ ctx[0]) return create_if_block$8;
    		return create_else_block$7;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block2 = current_block_type(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			label_1 = element("label");
    			t0 = text(/*label*/ ctx[2]);
    			t1 = space();
    			div0 = element("div");
    			input = element("input");
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			p = element("p");
    			if_block2.c();
    			attr(label_1, "class", "label");
    			attr(input, "class", input_class_value = "input " + /*validationClasses*/ ctx[13]);
    			input.readOnly = /*readonly*/ ctx[7];
    			attr(input, "type", "password");
    			attr(input, "name", /*fieldname*/ ctx[4]);
    			attr(input, "invalid", /*invalid*/ ctx[12]);
    			input.required = /*required*/ ctx[6];
    			attr(input, "placeholder", /*placeholder*/ ctx[3]);
    			attr(input, "autocomplete", /*fieldname*/ ctx[4]);
    			attr(input, "aria-controls", input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			attr(input, "aria-describedby", input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			attr(div0, "class", div0_class_value = "control " + /*iconClasses*/ ctx[10]);
    			attr(p, "class", p_class_value = "help " + /*validationClasses*/ ctx[13]);
    			attr(p, "id", p_id_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			attr(div1, "class", div1_class_value = "field form-field-password-" + /*fieldname*/ ctx[4]);
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, label_1);
    			append(label_1, t0);
    			append(div1, t1);
    			append(div1, div0);
    			append(div0, input);
    			set_input_value(input, /*value*/ ctx[1]);
    			append(div0, t2);
    			if (if_block0) if_block0.m(div0, null);
    			append(div0, t3);
    			if (if_block1) if_block1.m(div0, null);
    			append(div1, t4);
    			append(div1, p);
    			if_block2.m(p, null);

    			if (!mounted) {
    				dispose = [
    					listen(input, "input", /*input_input_handler*/ ctx[20]),
    					listen(input, "change", /*onBlur*/ ctx[14]),
    					listen(input, "input", /*onInput*/ ctx[15])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*label*/ 4) set_data(t0, /*label*/ ctx[2]);

    			if (dirty & /*validationClasses*/ 8192 && input_class_value !== (input_class_value = "input " + /*validationClasses*/ ctx[13])) {
    				attr(input, "class", input_class_value);
    			}

    			if (dirty & /*readonly*/ 128) {
    				input.readOnly = /*readonly*/ ctx[7];
    			}

    			if (dirty & /*fieldname*/ 16) {
    				attr(input, "name", /*fieldname*/ ctx[4]);
    			}

    			if (dirty & /*invalid*/ 4096) {
    				attr(input, "invalid", /*invalid*/ ctx[12]);
    			}

    			if (dirty & /*required*/ 64) {
    				input.required = /*required*/ ctx[6];
    			}

    			if (dirty & /*placeholder*/ 8) {
    				attr(input, "placeholder", /*placeholder*/ ctx[3]);
    			}

    			if (dirty & /*fieldname*/ 16) {
    				attr(input, "autocomplete", /*fieldname*/ ctx[4]);
    			}

    			if (dirty & /*fieldname*/ 16 && input_aria_controls_value !== (input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(input, "aria-controls", input_aria_controls_value);
    			}

    			if (dirty & /*fieldname*/ 16 && input_aria_describedby_value !== (input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(input, "aria-describedby", input_aria_describedby_value);
    			}

    			if (dirty & /*value*/ 2 && input.value !== /*value*/ ctx[1]) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}

    			if (/*icon*/ ctx[5]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4$3(ctx);
    					if_block0.c();
    					if_block0.m(div0, t3);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*validated*/ ctx[9] === true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$5(ctx);
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*iconClasses*/ 1024 && div0_class_value !== (div0_class_value = "control " + /*iconClasses*/ ctx[10])) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(p, null);
    				}
    			}

    			if (dirty & /*validationClasses*/ 8192 && p_class_value !== (p_class_value = "help " + /*validationClasses*/ ctx[13])) {
    				attr(p, "class", p_class_value);
    			}

    			if (dirty & /*fieldname*/ 16 && p_id_value !== (p_id_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(p, "id", p_id_value);
    			}

    			if (dirty & /*fieldname*/ 16 && div1_class_value !== (div1_class_value = "field form-field-password-" + /*fieldname*/ ctx[4])) {
    				attr(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let dispatch = createEventDispatcher();
    	let { inputStarted = false } = $$props;

    	let { validator = () => {
    		return true;
    	} } = $$props;

    	let { value = "" } = $$props;
    	let { label = "password" } = $$props;
    	let { placeholder = "input some text here, please" } = $$props;
    	let { fieldname = "password" } = $$props;
    	let { icon = false } = $$props;
    	let { required = true } = $$props;
    	let { readonly = false } = $$props;
    	let { valid = true } = $$props;
    	let { validated = false } = $$props;
    	let { errors = false } = $$props;
    	let { formErrors = false } = $$props;
    	let { formLevelError = false } = $$props;

    	function onBlur(ev) {
    		let data = {
    			field: fieldname,
    			value: ev.target.type === "checkbox"
    			? ev.target.checked
    			: ev.target.value
    		};

    		$$invalidate(0, inputStarted = true);
    		dispatch("change", data);
    		return true;
    	}

    	function onInput(ev) {
    		let data = { field: fieldname, value };
    		$$invalidate(0, inputStarted = true);
    		dispatch("change", data);
    		return true;
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	$$self.$set = $$props => {
    		if ("inputStarted" in $$props) $$invalidate(0, inputStarted = $$props.inputStarted);
    		if ("validator" in $$props) $$invalidate(16, validator = $$props.validator);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("label" in $$props) $$invalidate(2, label = $$props.label);
    		if ("placeholder" in $$props) $$invalidate(3, placeholder = $$props.placeholder);
    		if ("fieldname" in $$props) $$invalidate(4, fieldname = $$props.fieldname);
    		if ("icon" in $$props) $$invalidate(5, icon = $$props.icon);
    		if ("required" in $$props) $$invalidate(6, required = $$props.required);
    		if ("readonly" in $$props) $$invalidate(7, readonly = $$props.readonly);
    		if ("valid" in $$props) $$invalidate(8, valid = $$props.valid);
    		if ("validated" in $$props) $$invalidate(9, validated = $$props.validated);
    		if ("errors" in $$props) $$invalidate(17, errors = $$props.errors);
    		if ("formErrors" in $$props) $$invalidate(18, formErrors = $$props.formErrors);
    		if ("formLevelError" in $$props) $$invalidate(19, formLevelError = $$props.formLevelError);
    	};

    	let iconClasses;
    	let allErrors;
    	let helper;
    	let invalid;
    	let validationClasses;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 32) {
    			 $$invalidate(10, iconClasses = (icon ? " has-icons-left " : "") + " has-icons-right ");
    		}

    		if ($$self.$$.dirty & /*errors, formErrors*/ 393216) {
    			 $$invalidate(21, allErrors = [].concat(errors ? errors : [], formErrors ? formErrors : []));
    		}

    		if ($$self.$$.dirty & /*allErrors, placeholder*/ 2097160) {
    			 $$invalidate(11, helper = allErrors ? allErrors.join(", ") : placeholder);
    		}

    		if ($$self.$$.dirty & /*valid, formLevelError*/ 524544) {
    			 $$invalidate(12, invalid = valid === false || formLevelError);
    		}

    		if ($$self.$$.dirty & /*valid, inputStarted*/ 257) {
    			 $$invalidate(13, validationClasses = valid === true || !inputStarted ? CLASS_OK : CLASS_ERR);
    		}
    	};

    	return [
    		inputStarted,
    		value,
    		label,
    		placeholder,
    		fieldname,
    		icon,
    		required,
    		readonly,
    		valid,
    		validated,
    		iconClasses,
    		helper,
    		invalid,
    		validationClasses,
    		onBlur,
    		onInput,
    		validator,
    		errors,
    		formErrors,
    		formLevelError,
    		input_input_handler
    	];
    }

    class Ui_password extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			inputStarted: 0,
    			validator: 16,
    			value: 1,
    			label: 2,
    			placeholder: 3,
    			fieldname: 4,
    			icon: 5,
    			required: 6,
    			readonly: 7,
    			valid: 8,
    			validated: 9,
    			errors: 17,
    			formErrors: 18,
    			formLevelError: 19
    		});
    	}
    }

    /* src/form/ui.radio.svelte generated by Svelte v3.23.2 */

    class Ui_radio extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, null, null, safe_not_equal, {});
    	}
    }

    /* src/form/ui.radiogroup.svelte generated by Svelte v3.23.2 */

    class Ui_radiogroup extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, null, null, safe_not_equal, {});
    	}
    }

    /* src/form/ui.range.svelte generated by Svelte v3.23.2 */

    class Ui_range extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, null, null, safe_not_equal, {});
    	}
    }

    /* src/form/ui.select.svelte generated by Svelte v3.23.2 */

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[27] = list[i];
    	return child_ctx;
    }

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[27] = list[i];
    	return child_ctx;
    }

    // (95:6) {:else}
    function create_else_block_2(ctx) {
    	let select;
    	let if_block_anchor;
    	let mounted;
    	let dispose;
    	let if_block = /*placeholder*/ ctx[4].length > 0 && create_if_block_8(ctx);
    	let each_value_1 = /*variants*/ ctx[2];
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	return {
    		c() {
    			select = element("select");
    			if (if_block) if_block.c();
    			if_block_anchor = empty();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(select, "name", /*fieldname*/ ctx[5]);
    			attr(select, "readonly", /*readonly*/ ctx[7]);
    			if (/*value*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[23].call(select));
    		},
    		m(target, anchor) {
    			insert(target, select, anchor);
    			if (if_block) if_block.m(select, null);
    			append(select, if_block_anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*value*/ ctx[1]);

    			if (!mounted) {
    				dispose = [
    					listen(select, "change", /*select_change_handler*/ ctx[23]),
    					listen(select, "blur", /*onBlur*/ ctx[16]),
    					listen(select, "input", /*onInput*/ ctx[17])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (/*placeholder*/ ctx[4].length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_8(ctx);
    					if_block.c();
    					if_block.m(select, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*variants, value*/ 6) {
    				each_value_1 = /*variants*/ ctx[2];
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty[0] & /*fieldname*/ 32) {
    				attr(select, "name", /*fieldname*/ ctx[5]);
    			}

    			if (dirty[0] & /*readonly*/ 128) {
    				attr(select, "readonly", /*readonly*/ ctx[7]);
    			}

    			if (dirty[0] & /*value, variants*/ 6) {
    				select_option(select, /*value*/ ctx[1]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(select);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (82:6) {#if multiple }
    function create_if_block_5(ctx) {
    	let select;
    	let if_block_anchor;
    	let mounted;
    	let dispose;
    	let if_block = /*placeholder*/ ctx[4].length > 0 && create_if_block_6(ctx);
    	let each_value = /*variants*/ ctx[2];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
    	}

    	return {
    		c() {
    			select = element("select");
    			if (if_block) if_block.c();
    			if_block_anchor = empty();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(select, "name", /*fieldname*/ ctx[5]);
    			attr(select, "size", /*size*/ ctx[9]);
    			attr(select, "readonly", /*readonly*/ ctx[7]);
    			select.multiple = true;
    		},
    		m(target, anchor) {
    			insert(target, select, anchor);
    			if (if_block) if_block.m(select, null);
    			append(select, if_block_anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen(select, "blur", /*onBlur*/ ctx[16]),
    					listen(select, "input", /*onInput*/ ctx[17])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (/*placeholder*/ ctx[4].length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_6(ctx);
    					if_block.c();
    					if_block.m(select, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*variants, value*/ 6) {
    				each_value = /*variants*/ ctx[2];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$8(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$8(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*fieldname*/ 32) {
    				attr(select, "name", /*fieldname*/ ctx[5]);
    			}

    			if (dirty[0] & /*size*/ 512) {
    				attr(select, "size", /*size*/ ctx[9]);
    			}

    			if (dirty[0] & /*readonly*/ 128) {
    				attr(select, "readonly", /*readonly*/ ctx[7]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(select);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (97:8) {#if placeholder.length > 0 }
    function create_if_block_8(ctx) {
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*value*/ ctx[1]) return create_if_block_9;
    		return create_else_block_3;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (100:8) {:else}
    function create_else_block_3(ctx) {
    	let option;
    	let t;

    	return {
    		c() {
    			option = element("option");
    			t = text(/*placeholder*/ ctx[4]);
    			option.__value = CLEAR_MACRO;
    			option.value = option.__value;
    			option.selected = "selected";
    		},
    		m(target, anchor) {
    			insert(target, option, anchor);
    			append(option, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*placeholder*/ 16) set_data(t, /*placeholder*/ ctx[4]);
    		},
    		d(detaching) {
    			if (detaching) detach(option);
    		}
    	};
    }

    // (98:8) {#if value }
    function create_if_block_9(ctx) {
    	let option;
    	let t;

    	return {
    		c() {
    			option = element("option");
    			t = text(/*placeholder*/ ctx[4]);
    			option.__value = CLEAR_MACRO;
    			option.value = option.__value;
    		},
    		m(target, anchor) {
    			insert(target, option, anchor);
    			append(option, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*placeholder*/ 16) set_data(t, /*placeholder*/ ctx[4]);
    		},
    		d(detaching) {
    			if (detaching) detach(option);
    		}
    	};
    }

    // (104:8) {#each variants as variant}
    function create_each_block_1$1(ctx) {
    	let option;
    	let t_value = /*variant*/ ctx[27].title + "";
    	let t;
    	let option_value_value;
    	let option_selected_value;

    	return {
    		c() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*variant*/ ctx[27].id;
    			option.value = option.__value;
    			option.selected = option_selected_value = /*value*/ ctx[1] == /*variant*/ ctx[27].id;
    		},
    		m(target, anchor) {
    			insert(target, option, anchor);
    			append(option, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*variants*/ 4 && t_value !== (t_value = /*variant*/ ctx[27].title + "")) set_data(t, t_value);

    			if (dirty[0] & /*variants*/ 4 && option_value_value !== (option_value_value = /*variant*/ ctx[27].id)) {
    				option.__value = option_value_value;
    			}

    			option.value = option.__value;

    			if (dirty[0] & /*value, variants*/ 6 && option_selected_value !== (option_selected_value = /*value*/ ctx[1] == /*variant*/ ctx[27].id)) {
    				option.selected = option_selected_value;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(option);
    		}
    	};
    }

    // (84:8) {#if placeholder.length > 0 }
    function create_if_block_6(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*value*/ ctx[1]) return create_if_block_7;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (87:8) {:else}
    function create_else_block_1$1(ctx) {
    	let option;
    	let t;

    	return {
    		c() {
    			option = element("option");
    			t = text(/*placeholder*/ ctx[4]);
    			option.__value = CLEAR_MACRO;
    			option.value = option.__value;
    			option.selected = "selected";
    		},
    		m(target, anchor) {
    			insert(target, option, anchor);
    			append(option, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*placeholder*/ 16) set_data(t, /*placeholder*/ ctx[4]);
    		},
    		d(detaching) {
    			if (detaching) detach(option);
    		}
    	};
    }

    // (85:8) {#if value }
    function create_if_block_7(ctx) {
    	let option;
    	let t;

    	return {
    		c() {
    			option = element("option");
    			t = text(/*placeholder*/ ctx[4]);
    			option.__value = CLEAR_MACRO;
    			option.value = option.__value;
    		},
    		m(target, anchor) {
    			insert(target, option, anchor);
    			append(option, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*placeholder*/ 16) set_data(t, /*placeholder*/ ctx[4]);
    		},
    		d(detaching) {
    			if (detaching) detach(option);
    		}
    	};
    }

    // (91:8) {#each variants as variant}
    function create_each_block$8(ctx) {
    	let option;
    	let t_value = /*variant*/ ctx[27].title + "";
    	let t;
    	let option_value_value;
    	let option_selected_value;

    	return {
    		c() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*variant*/ ctx[27].id;
    			option.value = option.__value;
    			option.selected = option_selected_value = /*value*/ ctx[1].indexOf(/*variant*/ ctx[27].id) > -1;
    		},
    		m(target, anchor) {
    			insert(target, option, anchor);
    			append(option, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*variants*/ 4 && t_value !== (t_value = /*variant*/ ctx[27].title + "")) set_data(t, t_value);

    			if (dirty[0] & /*variants*/ 4 && option_value_value !== (option_value_value = /*variant*/ ctx[27].id)) {
    				option.__value = option_value_value;
    			}

    			option.value = option.__value;

    			if (dirty[0] & /*value, variants*/ 6 && option_selected_value !== (option_selected_value = /*value*/ ctx[1].indexOf(/*variant*/ ctx[27].id) > -1)) {
    				option.selected = option_selected_value;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(option);
    		}
    	};
    }

    // (110:4) {#if icon }
    function create_if_block_4$4(ctx) {
    	let span;
    	let i;
    	let i_class_value;

    	return {
    		c() {
    			span = element("span");
    			i = element("i");
    			attr(i, "class", i_class_value = "fas fa-" + /*icon*/ ctx[6]);
    			attr(span, "class", "icon is-small is-left");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, i);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*icon*/ 64 && i_class_value !== (i_class_value = "fas fa-" + /*icon*/ ctx[6])) {
    				attr(i, "class", i_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (113:4) {#if validated === true }
    function create_if_block_1$6(ctx) {
    	let span;

    	function select_block_type_3(ctx, dirty) {
    		if (/*valid*/ ctx[10] === true) return create_if_block_2$5;
    		if (/*valid*/ ctx[10] === false) return create_if_block_3$4;
    	}

    	let current_block_type = select_block_type_3(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	return {
    		c() {
    			span = element("span");
    			if (if_block) if_block.c();
    			attr(span, "class", "icon is-small is-right");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			if (if_block) if_block.m(span, null);
    		},
    		p(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type_3(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span, null);
    				}
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};
    }

    // (117:35) 
    function create_if_block_3$4(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-exclamation-triangle");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (115:6) {#if valid === true }
    function create_if_block_2$5(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-check");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (126:4) {:else}
    function create_else_block$8(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(" ");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (124:4) {#if !(validated && valid) && (inputStarted) }
    function create_if_block$9(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*helper*/ ctx[13]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*helper*/ 8192) set_data(t, /*helper*/ ctx[13]);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$i(ctx) {
    	let div2;
    	let label_1;
    	let t0;
    	let t1;
    	let div1;
    	let div0;
    	let div0_class_value;
    	let t2;
    	let t3;
    	let div1_class_value;
    	let t4;
    	let p;
    	let p_class_value;
    	let p_id_value;
    	let div2_class_value;

    	function select_block_type(ctx, dirty) {
    		if (/*multiple*/ ctx[8]) return create_if_block_5;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*icon*/ ctx[6] && create_if_block_4$4(ctx);
    	let if_block2 = /*validated*/ ctx[11] === true && create_if_block_1$6(ctx);

    	function select_block_type_4(ctx, dirty) {
    		if (!(/*validated*/ ctx[11] && /*valid*/ ctx[10]) && /*inputStarted*/ ctx[0]) return create_if_block$9;
    		return create_else_block$8;
    	}

    	let current_block_type_1 = select_block_type_4(ctx);
    	let if_block3 = current_block_type_1(ctx);

    	return {
    		c() {
    			div2 = element("div");
    			label_1 = element("label");
    			t0 = text(/*label*/ ctx[3]);
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			t4 = space();
    			p = element("p");
    			if_block3.c();
    			attr(label_1, "class", "label");
    			attr(div0, "class", div0_class_value = "select " + /*validationClasses*/ ctx[14] + " " + /*multipleClass*/ ctx[15]);
    			attr(div1, "class", div1_class_value = "control " + /*iconClasses*/ ctx[12]);
    			attr(p, "class", p_class_value = "help " + /*validationClasses*/ ctx[14]);
    			attr(p, "id", p_id_value = "input-field-helper-" + /*fieldname*/ ctx[5]);
    			attr(div2, "class", div2_class_value = "field form-field-select-" + /*fieldname*/ ctx[5]);
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, label_1);
    			append(label_1, t0);
    			append(div2, t1);
    			append(div2, div1);
    			append(div1, div0);
    			if_block0.m(div0, null);
    			append(div1, t2);
    			if (if_block1) if_block1.m(div1, null);
    			append(div1, t3);
    			if (if_block2) if_block2.m(div1, null);
    			append(div2, t4);
    			append(div2, p);
    			if_block3.m(p, null);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*label*/ 8) set_data(t0, /*label*/ ctx[3]);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			}

    			if (dirty[0] & /*validationClasses, multipleClass*/ 49152 && div0_class_value !== (div0_class_value = "select " + /*validationClasses*/ ctx[14] + " " + /*multipleClass*/ ctx[15])) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (/*icon*/ ctx[6]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_4$4(ctx);
    					if_block1.c();
    					if_block1.m(div1, t3);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*validated*/ ctx[11] === true) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_1$6(ctx);
    					if_block2.c();
    					if_block2.m(div1, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty[0] & /*iconClasses*/ 4096 && div1_class_value !== (div1_class_value = "control " + /*iconClasses*/ ctx[12])) {
    				attr(div1, "class", div1_class_value);
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_4(ctx)) && if_block3) {
    				if_block3.p(ctx, dirty);
    			} else {
    				if_block3.d(1);
    				if_block3 = current_block_type_1(ctx);

    				if (if_block3) {
    					if_block3.c();
    					if_block3.m(p, null);
    				}
    			}

    			if (dirty[0] & /*validationClasses*/ 16384 && p_class_value !== (p_class_value = "help " + /*validationClasses*/ ctx[14])) {
    				attr(p, "class", p_class_value);
    			}

    			if (dirty[0] & /*fieldname*/ 32 && p_id_value !== (p_id_value = "input-field-helper-" + /*fieldname*/ ctx[5])) {
    				attr(p, "id", p_id_value);
    			}

    			if (dirty[0] & /*fieldname*/ 32 && div2_class_value !== (div2_class_value = "field form-field-select-" + /*fieldname*/ ctx[5])) {
    				attr(div2, "class", div2_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div2);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if_block3.d();
    		}
    	};
    }

    const CLEAR_MACRO = "__CLEAR__";

    function instance$i($$self, $$props, $$invalidate) {
    	let dispatch = createEventDispatcher();
    	let { inputStarted = false } = $$props;

    	let { validator = () => {
    		return true;
    	} } = $$props;

    	let { value = "" } = $$props;
    	let { variants = [] } = $$props;
    	let { label = "select" } = $$props;
    	let { placeholder = "empty select item" } = $$props;
    	let { fieldname = "select" } = $$props;
    	let { icon = false } = $$props;
    	let { required = true } = $$props;
    	let { readonly = false } = $$props;
    	let { multiple = false } = $$props;
    	let { size = 8 } = $$props;
    	let { valid = true } = $$props;
    	let { validated = false } = $$props;
    	let { errors = false } = $$props;
    	let { formErrors = false } = $$props;
    	let { formLevelError = false } = $$props;

    	function onBlur(ev) {
    		let data = { field: fieldname, value: ev.target.value };

    		if (multiple) {
    			$$invalidate(1, value = Array.from(ev.target.selectedOptions).map(el => el.value));

    			if (value.indexOf(CLEAR_MACRO) > -1) {
    				$$invalidate(1, value = []);
    			}

    			data.value = value;
    		} else {
    			if (data.value === CLEAR_MACRO) {
    				$$invalidate(1, value = "");
    			}
    		}

    		$$invalidate(0, inputStarted = true);
    		dispatch("change", data);
    		return true;
    	}

    	function onInput(ev) {
    		let data = { field: fieldname, value };

    		if (multiple) {
    			$$invalidate(1, value = Array.from(ev.target.selectedOptions).map(el => el.value));

    			if (value.indexOf(CLEAR_MACRO) > -1) {
    				$$invalidate(1, value = []);
    			}

    			data.value = value;
    		} else {
    			if (data.value === CLEAR_MACRO) {
    				$$invalidate(1, value = "");
    			}
    		}

    		$$invalidate(0, inputStarted = true);
    		dispatch("change", data);
    		return true;
    	}

    	function select_change_handler() {
    		value = select_value(this);
    		$$invalidate(1, value);
    		$$invalidate(2, variants);
    	}

    	$$self.$set = $$props => {
    		if ("inputStarted" in $$props) $$invalidate(0, inputStarted = $$props.inputStarted);
    		if ("validator" in $$props) $$invalidate(18, validator = $$props.validator);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("variants" in $$props) $$invalidate(2, variants = $$props.variants);
    		if ("label" in $$props) $$invalidate(3, label = $$props.label);
    		if ("placeholder" in $$props) $$invalidate(4, placeholder = $$props.placeholder);
    		if ("fieldname" in $$props) $$invalidate(5, fieldname = $$props.fieldname);
    		if ("icon" in $$props) $$invalidate(6, icon = $$props.icon);
    		if ("required" in $$props) $$invalidate(19, required = $$props.required);
    		if ("readonly" in $$props) $$invalidate(7, readonly = $$props.readonly);
    		if ("multiple" in $$props) $$invalidate(8, multiple = $$props.multiple);
    		if ("size" in $$props) $$invalidate(9, size = $$props.size);
    		if ("valid" in $$props) $$invalidate(10, valid = $$props.valid);
    		if ("validated" in $$props) $$invalidate(11, validated = $$props.validated);
    		if ("errors" in $$props) $$invalidate(20, errors = $$props.errors);
    		if ("formErrors" in $$props) $$invalidate(21, formErrors = $$props.formErrors);
    		if ("formLevelError" in $$props) $$invalidate(22, formLevelError = $$props.formLevelError);
    	};

    	let iconClasses;
    	let allErrors;
    	let helper;
    	let validationClasses;
    	let multipleClass;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*icon*/ 64) {
    			 $$invalidate(12, iconClasses = (icon ? " has-icons-left " : "") + " has-icons-right ");
    		}

    		if ($$self.$$.dirty[0] & /*errors, formErrors*/ 3145728) {
    			 $$invalidate(24, allErrors = [].concat(errors ? errors : [], formErrors ? formErrors : []));
    		}

    		if ($$self.$$.dirty[0] & /*allErrors, placeholder*/ 16777232) {
    			 $$invalidate(13, helper = allErrors ? allErrors.join(", ") : placeholder);
    		}

    		if ($$self.$$.dirty[0] & /*valid, formLevelError*/ 4195328) ;

    		if ($$self.$$.dirty[0] & /*valid, inputStarted*/ 1025) {
    			 $$invalidate(14, validationClasses = valid === true || !inputStarted ? CLASS_OK : CLASS_ERR);
    		}

    		if ($$self.$$.dirty[0] & /*multiple*/ 256) {
    			 $$invalidate(15, multipleClass = multiple ? " is-multiple " : "");
    		}
    	};

    	return [
    		inputStarted,
    		value,
    		variants,
    		label,
    		placeholder,
    		fieldname,
    		icon,
    		readonly,
    		multiple,
    		size,
    		valid,
    		validated,
    		iconClasses,
    		helper,
    		validationClasses,
    		multipleClass,
    		onBlur,
    		onInput,
    		validator,
    		required,
    		errors,
    		formErrors,
    		formLevelError,
    		select_change_handler
    	];
    }

    class Ui_select extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(
    			this,
    			options,
    			instance$i,
    			create_fragment$i,
    			safe_not_equal,
    			{
    				inputStarted: 0,
    				validator: 18,
    				value: 1,
    				variants: 2,
    				label: 3,
    				placeholder: 4,
    				fieldname: 5,
    				icon: 6,
    				required: 19,
    				readonly: 7,
    				multiple: 8,
    				size: 9,
    				valid: 10,
    				validated: 11,
    				errors: 20,
    				formErrors: 21,
    				formLevelError: 22
    			},
    			[-1, -1]
    		);
    	}
    }

    /* src/form/ui.slider.svelte generated by Svelte v3.23.2 */

    class Ui_slider extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, null, null, safe_not_equal, {});
    	}
    }

    /* src/form/ui.switch.svelte generated by Svelte v3.23.2 */

    function create_else_block$9(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(" ");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (70:4) {#if !(validated && valid) && (inputStarted) }
    function create_if_block$a(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*helper*/ ctx[11]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*helper*/ 2048) set_data(t, /*helper*/ ctx[11]);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$j(ctx) {
    	let div1;
    	let div0;
    	let input;
    	let input_class_value;
    	let input_id_value;
    	let input_aria_controls_value;
    	let input_aria_describedby_value;
    	let t0;
    	let label_1;
    	let t1;
    	let label_1_for_value;
    	let t2;
    	let p;
    	let p_class_value;
    	let p_id_value;
    	let div1_class_value;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (!(/*validated*/ ctx[10] && /*valid*/ ctx[8]) && /*inputStarted*/ ctx[0]) return create_if_block$a;
    		return create_else_block$9;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			input = element("input");
    			t0 = space();
    			label_1 = element("label");
    			t1 = text(/*label*/ ctx[2]);
    			t2 = space();
    			p = element("p");
    			if_block.c();
    			attr(input, "type", "checkbox");
    			attr(input, "class", input_class_value = "switch " + /*styling*/ ctx[9]);
    			attr(input, "id", input_id_value = "edit-form-switch-" + /*fieldname*/ ctx[4]);
    			attr(input, "placeholder", /*placeholder*/ ctx[3]);
    			attr(input, "name", /*fieldname*/ ctx[4]);
    			input.required = /*required*/ ctx[5];
    			input.readOnly = /*readonly*/ ctx[6];
    			attr(input, "invalid", /*invalid*/ ctx[12]);
    			attr(input, "aria-controls", input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			attr(input, "aria-describedby", input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			input.disabled = /*disabled*/ ctx[7];
    			attr(label_1, "class", "label");
    			attr(label_1, "for", label_1_for_value = "edit-form-switch-" + /*fieldname*/ ctx[4]);
    			attr(div0, "class", "control");
    			attr(p, "class", p_class_value = "help " + /*validationClasses*/ ctx[13]);
    			attr(p, "id", p_id_value = "form-field-helper-" + /*fieldname*/ ctx[4]);
    			attr(div1, "class", div1_class_value = "field form-field-switch-" + /*fieldname*/ ctx[4]);
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, input);
    			input.checked = /*value*/ ctx[1];
    			append(div0, t0);
    			append(div0, label_1);
    			append(label_1, t1);
    			append(div1, t2);
    			append(div1, p);
    			if_block.m(p, null);

    			if (!mounted) {
    				dispose = [
    					listen(input, "change", /*input_change_handler*/ ctx[21]),
    					listen(input, "blur", /*onBlur*/ ctx[14]),
    					listen(input, "input", /*onInput*/ ctx[15])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*styling*/ 512 && input_class_value !== (input_class_value = "switch " + /*styling*/ ctx[9])) {
    				attr(input, "class", input_class_value);
    			}

    			if (dirty & /*fieldname*/ 16 && input_id_value !== (input_id_value = "edit-form-switch-" + /*fieldname*/ ctx[4])) {
    				attr(input, "id", input_id_value);
    			}

    			if (dirty & /*placeholder*/ 8) {
    				attr(input, "placeholder", /*placeholder*/ ctx[3]);
    			}

    			if (dirty & /*fieldname*/ 16) {
    				attr(input, "name", /*fieldname*/ ctx[4]);
    			}

    			if (dirty & /*required*/ 32) {
    				input.required = /*required*/ ctx[5];
    			}

    			if (dirty & /*readonly*/ 64) {
    				input.readOnly = /*readonly*/ ctx[6];
    			}

    			if (dirty & /*invalid*/ 4096) {
    				attr(input, "invalid", /*invalid*/ ctx[12]);
    			}

    			if (dirty & /*fieldname*/ 16 && input_aria_controls_value !== (input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(input, "aria-controls", input_aria_controls_value);
    			}

    			if (dirty & /*fieldname*/ 16 && input_aria_describedby_value !== (input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(input, "aria-describedby", input_aria_describedby_value);
    			}

    			if (dirty & /*disabled*/ 128) {
    				input.disabled = /*disabled*/ ctx[7];
    			}

    			if (dirty & /*value*/ 2) {
    				input.checked = /*value*/ ctx[1];
    			}

    			if (dirty & /*label*/ 4) set_data(t1, /*label*/ ctx[2]);

    			if (dirty & /*fieldname*/ 16 && label_1_for_value !== (label_1_for_value = "edit-form-switch-" + /*fieldname*/ ctx[4])) {
    				attr(label_1, "for", label_1_for_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(p, null);
    				}
    			}

    			if (dirty & /*validationClasses*/ 8192 && p_class_value !== (p_class_value = "help " + /*validationClasses*/ ctx[13])) {
    				attr(p, "class", p_class_value);
    			}

    			if (dirty & /*fieldname*/ 16 && p_id_value !== (p_id_value = "form-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(p, "id", p_id_value);
    			}

    			if (dirty & /*fieldname*/ 16 && div1_class_value !== (div1_class_value = "field form-field-switch-" + /*fieldname*/ ctx[4])) {
    				attr(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div1);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let dispatch = createEventDispatcher();
    	let { inputStarted = false } = $$props;

    	let { validator = () => {
    		return true;
    	} } = $$props;

    	let { value = "" } = $$props;
    	let { label = "textfield" } = $$props;
    	let { placeholder = "input some text here, please" } = $$props;
    	let { fieldname = "textfield" } = $$props;
    	let { icon = false } = $$props;
    	let { required = true } = $$props;
    	let { readonly = false } = $$props;
    	let { disabled = false } = $$props;
    	let { valid = true } = $$props;
    	let { styling = " is-rounded is-success " } = $$props;
    	let { validated = false } = $$props;
    	let { errors = false } = $$props;
    	let { formErrors = false } = $$props;
    	let { formLevelError = false } = $$props;

    	function onBlur(ev) {
    		let data = {
    			field: fieldname,
    			value: ev.target.type === "checkbox"
    			? ev.target.checked
    			: ev.target.value
    		};

    		$$invalidate(0, inputStarted = true);
    		dispatch("change", data);
    		return true;
    	}

    	function onInput(ev) {
    		let data = { field: fieldname, value };
    		$$invalidate(0, inputStarted = true);
    		dispatch("change", data);
    		return true;
    	}

    	function input_change_handler() {
    		value = this.checked;
    		$$invalidate(1, value);
    	}

    	$$self.$set = $$props => {
    		if ("inputStarted" in $$props) $$invalidate(0, inputStarted = $$props.inputStarted);
    		if ("validator" in $$props) $$invalidate(16, validator = $$props.validator);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("label" in $$props) $$invalidate(2, label = $$props.label);
    		if ("placeholder" in $$props) $$invalidate(3, placeholder = $$props.placeholder);
    		if ("fieldname" in $$props) $$invalidate(4, fieldname = $$props.fieldname);
    		if ("icon" in $$props) $$invalidate(17, icon = $$props.icon);
    		if ("required" in $$props) $$invalidate(5, required = $$props.required);
    		if ("readonly" in $$props) $$invalidate(6, readonly = $$props.readonly);
    		if ("disabled" in $$props) $$invalidate(7, disabled = $$props.disabled);
    		if ("valid" in $$props) $$invalidate(8, valid = $$props.valid);
    		if ("styling" in $$props) $$invalidate(9, styling = $$props.styling);
    		if ("validated" in $$props) $$invalidate(10, validated = $$props.validated);
    		if ("errors" in $$props) $$invalidate(18, errors = $$props.errors);
    		if ("formErrors" in $$props) $$invalidate(19, formErrors = $$props.formErrors);
    		if ("formLevelError" in $$props) $$invalidate(20, formLevelError = $$props.formLevelError);
    	};
    	let allErrors;
    	let helper;
    	let invalid;
    	let validationClasses;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 131072) ;

    		if ($$self.$$.dirty & /*errors, formErrors*/ 786432) {
    			 $$invalidate(23, allErrors = [].concat(errors ? errors : [], formErrors ? formErrors : []));
    		}

    		if ($$self.$$.dirty & /*allErrors, placeholder*/ 8388616) {
    			 $$invalidate(11, helper = allErrors ? allErrors.join(", ") : placeholder);
    		}

    		if ($$self.$$.dirty & /*valid, formLevelError*/ 1048832) {
    			 $$invalidate(12, invalid = valid === false || formLevelError);
    		}

    		if ($$self.$$.dirty & /*valid, inputStarted*/ 257) {
    			 $$invalidate(13, validationClasses = valid === true || !inputStarted ? CLASS_OK : CLASS_ERR);
    		}
    	};

    	return [
    		inputStarted,
    		value,
    		label,
    		placeholder,
    		fieldname,
    		required,
    		readonly,
    		disabled,
    		valid,
    		styling,
    		validated,
    		helper,
    		invalid,
    		validationClasses,
    		onBlur,
    		onInput,
    		validator,
    		icon,
    		errors,
    		formErrors,
    		formLevelError,
    		input_change_handler
    	];
    }

    class Ui_switch extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {
    			inputStarted: 0,
    			validator: 16,
    			value: 1,
    			label: 2,
    			placeholder: 3,
    			fieldname: 4,
    			icon: 17,
    			required: 5,
    			readonly: 6,
    			disabled: 7,
    			valid: 8,
    			styling: 9,
    			validated: 10,
    			errors: 18,
    			formErrors: 19,
    			formLevelError: 20
    		});
    	}
    }

    /* src/form/ui.telephone.svelte generated by Svelte v3.23.2 */

    function create_if_block_4$5(ctx) {
    	let span;
    	let i;
    	let i_class_value;

    	return {
    		c() {
    			span = element("span");
    			i = element("i");
    			attr(i, "class", i_class_value = "fas fa-" + /*icon*/ ctx[5]);
    			attr(span, "class", "icon is-small is-left");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, i);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*icon*/ 32 && i_class_value !== (i_class_value = "fas fa-" + /*icon*/ ctx[5])) {
    				attr(i, "class", i_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (59:4) {#if validated === true }
    function create_if_block_1$7(ctx) {
    	let span;

    	function select_block_type(ctx, dirty) {
    		if (/*valid*/ ctx[8] === true) return create_if_block_2$6;
    		if (/*valid*/ ctx[8] === false) return create_if_block_3$5;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	return {
    		c() {
    			span = element("span");
    			if (if_block) if_block.c();
    			attr(span, "class", "icon is-small is-right");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			if (if_block) if_block.m(span, null);
    		},
    		p(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span, null);
    				}
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};
    }

    // (63:35) 
    function create_if_block_3$5(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-exclamation-triangle");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (61:6) {#if valid === true }
    function create_if_block_2$6(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-check");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (72:4) {:else}
    function create_else_block$a(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(" ");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (70:4) {#if !(validated && valid) && (inputStarted) }
    function create_if_block$b(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*helper*/ ctx[11]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*helper*/ 2048) set_data(t, /*helper*/ ctx[11]);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$k(ctx) {
    	let div1;
    	let label_1;
    	let t0;
    	let t1;
    	let div0;
    	let input;
    	let input_class_value;
    	let input_aria_controls_value;
    	let input_aria_describedby_value;
    	let t2;
    	let t3;
    	let div0_class_value;
    	let t4;
    	let p;
    	let p_class_value;
    	let p_id_value;
    	let div1_class_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*icon*/ ctx[5] && create_if_block_4$5(ctx);
    	let if_block1 = /*validated*/ ctx[9] === true && create_if_block_1$7(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (!(/*validated*/ ctx[9] && /*valid*/ ctx[8]) && /*inputStarted*/ ctx[0]) return create_if_block$b;
    		return create_else_block$a;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block2 = current_block_type(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			label_1 = element("label");
    			t0 = text(/*label*/ ctx[2]);
    			t1 = space();
    			div0 = element("div");
    			input = element("input");
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			p = element("p");
    			if_block2.c();
    			attr(label_1, "class", "label");
    			attr(input, "class", input_class_value = "input " + /*validationClasses*/ ctx[13]);
    			attr(input, "type", "tel");
    			attr(input, "name", /*fieldname*/ ctx[4]);
    			attr(input, "invalid", /*invalid*/ ctx[12]);
    			input.required = /*required*/ ctx[6];
    			attr(input, "placeholder", /*placeholder*/ ctx[3]);
    			attr(input, "autocomplete", /*fieldname*/ ctx[4]);
    			attr(input, "aria-controls", input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			input.readOnly = /*readonly*/ ctx[7];
    			attr(input, "aria-describedby", input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			attr(div0, "class", div0_class_value = "control " + /*iconClasses*/ ctx[10]);
    			attr(p, "class", p_class_value = "help " + /*validationClasses*/ ctx[13]);
    			attr(p, "id", p_id_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			attr(div1, "class", div1_class_value = "field form-field-telephone-" + /*fieldname*/ ctx[4]);
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, label_1);
    			append(label_1, t0);
    			append(div1, t1);
    			append(div1, div0);
    			append(div0, input);
    			set_input_value(input, /*value*/ ctx[1]);
    			append(div0, t2);
    			if (if_block0) if_block0.m(div0, null);
    			append(div0, t3);
    			if (if_block1) if_block1.m(div0, null);
    			append(div1, t4);
    			append(div1, p);
    			if_block2.m(p, null);

    			if (!mounted) {
    				dispose = [
    					listen(input, "input", /*input_input_handler*/ ctx[20]),
    					listen(input, "change", /*onBlur*/ ctx[14]),
    					listen(input, "input", /*onInput*/ ctx[15])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*label*/ 4) set_data(t0, /*label*/ ctx[2]);

    			if (dirty & /*validationClasses*/ 8192 && input_class_value !== (input_class_value = "input " + /*validationClasses*/ ctx[13])) {
    				attr(input, "class", input_class_value);
    			}

    			if (dirty & /*fieldname*/ 16) {
    				attr(input, "name", /*fieldname*/ ctx[4]);
    			}

    			if (dirty & /*invalid*/ 4096) {
    				attr(input, "invalid", /*invalid*/ ctx[12]);
    			}

    			if (dirty & /*required*/ 64) {
    				input.required = /*required*/ ctx[6];
    			}

    			if (dirty & /*placeholder*/ 8) {
    				attr(input, "placeholder", /*placeholder*/ ctx[3]);
    			}

    			if (dirty & /*fieldname*/ 16) {
    				attr(input, "autocomplete", /*fieldname*/ ctx[4]);
    			}

    			if (dirty & /*fieldname*/ 16 && input_aria_controls_value !== (input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(input, "aria-controls", input_aria_controls_value);
    			}

    			if (dirty & /*readonly*/ 128) {
    				input.readOnly = /*readonly*/ ctx[7];
    			}

    			if (dirty & /*fieldname*/ 16 && input_aria_describedby_value !== (input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(input, "aria-describedby", input_aria_describedby_value);
    			}

    			if (dirty & /*value*/ 2) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}

    			if (/*icon*/ ctx[5]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4$5(ctx);
    					if_block0.c();
    					if_block0.m(div0, t3);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*validated*/ ctx[9] === true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$7(ctx);
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*iconClasses*/ 1024 && div0_class_value !== (div0_class_value = "control " + /*iconClasses*/ ctx[10])) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(p, null);
    				}
    			}

    			if (dirty & /*validationClasses*/ 8192 && p_class_value !== (p_class_value = "help " + /*validationClasses*/ ctx[13])) {
    				attr(p, "class", p_class_value);
    			}

    			if (dirty & /*fieldname*/ 16 && p_id_value !== (p_id_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(p, "id", p_id_value);
    			}

    			if (dirty & /*fieldname*/ 16 && div1_class_value !== (div1_class_value = "field form-field-telephone-" + /*fieldname*/ ctx[4])) {
    				attr(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let dispatch = createEventDispatcher();
    	let { inputStarted = false } = $$props;

    	let { validator = () => {
    		return true;
    	} } = $$props;

    	let { value = "" } = $$props;
    	let { label = "telephone" } = $$props;
    	let { placeholder = "+79876543210" } = $$props;
    	let { fieldname = "telephone" } = $$props;
    	let { icon = false } = $$props;
    	let { required = true } = $$props;
    	let { readonly = false } = $$props;
    	let { valid = true } = $$props;
    	let { validated = false } = $$props;
    	let { errors = false } = $$props;
    	let { formErrors = false } = $$props;
    	let { formLevelError = false } = $$props;

    	function onBlur(ev) {
    		let data = {
    			field: fieldname,
    			value: ev.target.type === "checkbox"
    			? ev.target.checked
    			: ev.target.value
    		};

    		$$invalidate(0, inputStarted = true);
    		dispatch("change", data);
    		return true;
    	}

    	function onInput(ev) {
    		let data = { field: fieldname, value };
    		$$invalidate(0, inputStarted = true);
    		dispatch("change", data);
    		return true;
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	$$self.$set = $$props => {
    		if ("inputStarted" in $$props) $$invalidate(0, inputStarted = $$props.inputStarted);
    		if ("validator" in $$props) $$invalidate(16, validator = $$props.validator);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("label" in $$props) $$invalidate(2, label = $$props.label);
    		if ("placeholder" in $$props) $$invalidate(3, placeholder = $$props.placeholder);
    		if ("fieldname" in $$props) $$invalidate(4, fieldname = $$props.fieldname);
    		if ("icon" in $$props) $$invalidate(5, icon = $$props.icon);
    		if ("required" in $$props) $$invalidate(6, required = $$props.required);
    		if ("readonly" in $$props) $$invalidate(7, readonly = $$props.readonly);
    		if ("valid" in $$props) $$invalidate(8, valid = $$props.valid);
    		if ("validated" in $$props) $$invalidate(9, validated = $$props.validated);
    		if ("errors" in $$props) $$invalidate(17, errors = $$props.errors);
    		if ("formErrors" in $$props) $$invalidate(18, formErrors = $$props.formErrors);
    		if ("formLevelError" in $$props) $$invalidate(19, formLevelError = $$props.formLevelError);
    	};

    	let iconClasses;
    	let allErrors;
    	let helper;
    	let invalid;
    	let validationClasses;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 32) {
    			 $$invalidate(10, iconClasses = (icon ? " has-icons-left " : "") + " has-icons-right ");
    		}

    		if ($$self.$$.dirty & /*errors, formErrors*/ 393216) {
    			 $$invalidate(21, allErrors = [].concat(errors ? errors : [], formErrors ? formErrors : []));
    		}

    		if ($$self.$$.dirty & /*allErrors, placeholder*/ 2097160) {
    			 $$invalidate(11, helper = allErrors ? allErrors.join(", ") : placeholder);
    		}

    		if ($$self.$$.dirty & /*valid, formLevelError*/ 524544) {
    			 $$invalidate(12, invalid = valid === false || formLevelError);
    		}

    		if ($$self.$$.dirty & /*valid, inputStarted*/ 257) {
    			 $$invalidate(13, validationClasses = valid === true || !inputStarted ? CLASS_OK : CLASS_ERR);
    		}
    	};

    	return [
    		inputStarted,
    		value,
    		label,
    		placeholder,
    		fieldname,
    		icon,
    		required,
    		readonly,
    		valid,
    		validated,
    		iconClasses,
    		helper,
    		invalid,
    		validationClasses,
    		onBlur,
    		onInput,
    		validator,
    		errors,
    		formErrors,
    		formLevelError,
    		input_input_handler
    	];
    }

    class Ui_telephone extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {
    			inputStarted: 0,
    			validator: 16,
    			value: 1,
    			label: 2,
    			placeholder: 3,
    			fieldname: 4,
    			icon: 5,
    			required: 6,
    			readonly: 7,
    			valid: 8,
    			validated: 9,
    			errors: 17,
    			formErrors: 18,
    			formLevelError: 19
    		});
    	}
    }

    /* src/form/ui.textarea.svelte generated by Svelte v3.23.2 */

    function create_if_block_4$6(ctx) {
    	let span;
    	let i;
    	let i_class_value;

    	return {
    		c() {
    			span = element("span");
    			i = element("i");
    			attr(i, "class", i_class_value = "fas fa-" + /*icon*/ ctx[5]);
    			attr(span, "class", "icon is-small is-left");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, i);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*icon*/ 32 && i_class_value !== (i_class_value = "fas fa-" + /*icon*/ ctx[5])) {
    				attr(i, "class", i_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (66:4) {#if validated === true }
    function create_if_block_1$8(ctx) {
    	let span;

    	function select_block_type(ctx, dirty) {
    		if (/*valid*/ ctx[9] === true) return create_if_block_2$7;
    		if (/*valid*/ ctx[9] === false) return create_if_block_3$6;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	return {
    		c() {
    			span = element("span");
    			if (if_block) if_block.c();
    			attr(span, "class", "icon is-small is-right");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			if (if_block) if_block.m(span, null);
    		},
    		p(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span, null);
    				}
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};
    }

    // (70:35) 
    function create_if_block_3$6(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-exclamation-triangle");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (68:6) {#if valid === true }
    function create_if_block_2$7(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-check");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (79:4) {:else}
    function create_else_block$b(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(" ");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (77:4) {#if !(validated && valid) && (inputStarted) }
    function create_if_block$c(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*helper*/ ctx[12]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*helper*/ 4096) set_data(t, /*helper*/ ctx[12]);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$l(ctx) {
    	let div1;
    	let label_1;
    	let t0;
    	let t1;
    	let div0;
    	let textarea;
    	let textarea_class_value;
    	let textarea_aria_controls_value;
    	let textarea_aria_describedby_value;
    	let t2;
    	let t3;
    	let div0_class_value;
    	let t4;
    	let p;
    	let p_class_value;
    	let p_id_value;
    	let div1_class_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*icon*/ ctx[5] && create_if_block_4$6(ctx);
    	let if_block1 = /*validated*/ ctx[10] === true && create_if_block_1$8(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (!(/*validated*/ ctx[10] && /*valid*/ ctx[9]) && /*inputStarted*/ ctx[0]) return create_if_block$c;
    		return create_else_block$b;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block2 = current_block_type(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			label_1 = element("label");
    			t0 = text(/*label*/ ctx[2]);
    			t1 = space();
    			div0 = element("div");
    			textarea = element("textarea");
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			p = element("p");
    			if_block2.c();
    			attr(label_1, "class", "label");
    			attr(textarea, "invalid", /*invalid*/ ctx[13]);
    			attr(textarea, "class", textarea_class_value = "textarea " + /*validationClasses*/ ctx[14]);
    			textarea.required = /*required*/ ctx[7];
    			textarea.readOnly = /*readonly*/ ctx[8];
    			attr(textarea, "name", /*fieldname*/ ctx[4]);
    			attr(textarea, "placeholder", /*placeholder*/ ctx[3]);
    			attr(textarea, "rows", /*rows*/ ctx[6]);
    			attr(textarea, "aria-controls", textarea_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			attr(textarea, "aria-describedby", textarea_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			attr(div0, "class", div0_class_value = "control " + /*iconClasses*/ ctx[11]);
    			attr(p, "class", p_class_value = "help " + /*validationClasses*/ ctx[14]);
    			attr(p, "id", p_id_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			attr(div1, "class", div1_class_value = "field form-field-textarea-" + /*fieldname*/ ctx[4]);
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, label_1);
    			append(label_1, t0);
    			append(div1, t1);
    			append(div1, div0);
    			append(div0, textarea);
    			set_input_value(textarea, /*value*/ ctx[1]);
    			append(div0, t2);
    			if (if_block0) if_block0.m(div0, null);
    			append(div0, t3);
    			if (if_block1) if_block1.m(div0, null);
    			append(div1, t4);
    			append(div1, p);
    			if_block2.m(p, null);

    			if (!mounted) {
    				dispose = [
    					listen(textarea, "blur", /*onBlur*/ ctx[15]),
    					listen(textarea, "input", /*textarea_input_handler*/ ctx[20])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*label*/ 4) set_data(t0, /*label*/ ctx[2]);

    			if (dirty & /*invalid*/ 8192) {
    				attr(textarea, "invalid", /*invalid*/ ctx[13]);
    			}

    			if (dirty & /*validationClasses*/ 16384 && textarea_class_value !== (textarea_class_value = "textarea " + /*validationClasses*/ ctx[14])) {
    				attr(textarea, "class", textarea_class_value);
    			}

    			if (dirty & /*required*/ 128) {
    				textarea.required = /*required*/ ctx[7];
    			}

    			if (dirty & /*readonly*/ 256) {
    				textarea.readOnly = /*readonly*/ ctx[8];
    			}

    			if (dirty & /*fieldname*/ 16) {
    				attr(textarea, "name", /*fieldname*/ ctx[4]);
    			}

    			if (dirty & /*placeholder*/ 8) {
    				attr(textarea, "placeholder", /*placeholder*/ ctx[3]);
    			}

    			if (dirty & /*rows*/ 64) {
    				attr(textarea, "rows", /*rows*/ ctx[6]);
    			}

    			if (dirty & /*fieldname*/ 16 && textarea_aria_controls_value !== (textarea_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(textarea, "aria-controls", textarea_aria_controls_value);
    			}

    			if (dirty & /*fieldname*/ 16 && textarea_aria_describedby_value !== (textarea_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(textarea, "aria-describedby", textarea_aria_describedby_value);
    			}

    			if (dirty & /*value*/ 2) {
    				set_input_value(textarea, /*value*/ ctx[1]);
    			}

    			if (/*icon*/ ctx[5]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4$6(ctx);
    					if_block0.c();
    					if_block0.m(div0, t3);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*validated*/ ctx[10] === true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$8(ctx);
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*iconClasses*/ 2048 && div0_class_value !== (div0_class_value = "control " + /*iconClasses*/ ctx[11])) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(p, null);
    				}
    			}

    			if (dirty & /*validationClasses*/ 16384 && p_class_value !== (p_class_value = "help " + /*validationClasses*/ ctx[14])) {
    				attr(p, "class", p_class_value);
    			}

    			if (dirty & /*fieldname*/ 16 && p_id_value !== (p_id_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(p, "id", p_id_value);
    			}

    			if (dirty & /*fieldname*/ 16 && div1_class_value !== (div1_class_value = "field form-field-textarea-" + /*fieldname*/ ctx[4])) {
    				attr(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let dispatch = createEventDispatcher();
    	let { inputStarted = false } = $$props;

    	let { validator = () => {
    		return true;
    	} } = $$props;

    	let { value = "" } = $$props;
    	let { label = "textarea" } = $$props;
    	let { placeholder = "input some text here, please" } = $$props;
    	let { fieldname = "textarea" } = $$props;
    	let { icon = false } = $$props;
    	let { rows = 10 } = $$props;
    	let { required = true } = $$props;
    	let { readonly = false } = $$props;
    	let { valid = true } = $$props;
    	let { validated = false } = $$props;
    	let { errors = false } = $$props;
    	let { formErrors = false } = $$props;
    	let { formLevelError = false } = $$props;

    	function onBlur(ev) {
    		let data = {
    			field: fieldname,
    			value: ev.target.type === "checkbox"
    			? ev.target.checked
    			: ev.target.value
    		};

    		$$invalidate(0, inputStarted = true);
    		dispatch("change", data);
    		return true;
    	}

    	function textarea_input_handler() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	$$self.$set = $$props => {
    		if ("inputStarted" in $$props) $$invalidate(0, inputStarted = $$props.inputStarted);
    		if ("validator" in $$props) $$invalidate(16, validator = $$props.validator);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("label" in $$props) $$invalidate(2, label = $$props.label);
    		if ("placeholder" in $$props) $$invalidate(3, placeholder = $$props.placeholder);
    		if ("fieldname" in $$props) $$invalidate(4, fieldname = $$props.fieldname);
    		if ("icon" in $$props) $$invalidate(5, icon = $$props.icon);
    		if ("rows" in $$props) $$invalidate(6, rows = $$props.rows);
    		if ("required" in $$props) $$invalidate(7, required = $$props.required);
    		if ("readonly" in $$props) $$invalidate(8, readonly = $$props.readonly);
    		if ("valid" in $$props) $$invalidate(9, valid = $$props.valid);
    		if ("validated" in $$props) $$invalidate(10, validated = $$props.validated);
    		if ("errors" in $$props) $$invalidate(17, errors = $$props.errors);
    		if ("formErrors" in $$props) $$invalidate(18, formErrors = $$props.formErrors);
    		if ("formLevelError" in $$props) $$invalidate(19, formLevelError = $$props.formLevelError);
    	};

    	let iconClasses;
    	let allErrors;
    	let helper;
    	let invalid;
    	let validationClasses;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 32) {
    			 $$invalidate(11, iconClasses = (icon ? " has-icons-left " : "") + " has-icons-right ");
    		}

    		if ($$self.$$.dirty & /*errors, formErrors*/ 393216) {
    			 $$invalidate(21, allErrors = [].concat(errors ? errors : [], formErrors ? formErrors : []));
    		}

    		if ($$self.$$.dirty & /*allErrors, placeholder*/ 2097160) {
    			 $$invalidate(12, helper = allErrors ? allErrors.join(", ") : placeholder);
    		}

    		if ($$self.$$.dirty & /*valid, formLevelError*/ 524800) {
    			 $$invalidate(13, invalid = valid === false || formLevelError);
    		}

    		if ($$self.$$.dirty & /*valid, inputStarted*/ 513) {
    			 $$invalidate(14, validationClasses = valid === true || !inputStarted ? CLASS_OK : CLASS_ERR);
    		}
    	};

    	return [
    		inputStarted,
    		value,
    		label,
    		placeholder,
    		fieldname,
    		icon,
    		rows,
    		required,
    		readonly,
    		valid,
    		validated,
    		iconClasses,
    		helper,
    		invalid,
    		validationClasses,
    		onBlur,
    		validator,
    		errors,
    		formErrors,
    		formLevelError,
    		textarea_input_handler
    	];
    }

    class Ui_textarea extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {
    			inputStarted: 0,
    			validator: 16,
    			value: 1,
    			label: 2,
    			placeholder: 3,
    			fieldname: 4,
    			icon: 5,
    			rows: 6,
    			required: 7,
    			readonly: 8,
    			valid: 9,
    			validated: 10,
    			errors: 17,
    			formErrors: 18,
    			formLevelError: 19
    		});
    	}
    }

    /* src/form/ui.textfield.svelte generated by Svelte v3.23.2 */

    function create_if_block_4$7(ctx) {
    	let span;
    	let i;
    	let i_class_value;

    	return {
    		c() {
    			span = element("span");
    			i = element("i");
    			attr(i, "class", i_class_value = "fas fa-" + /*icon*/ ctx[5]);
    			attr(span, "class", "icon is-small is-left");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, i);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*icon*/ 32 && i_class_value !== (i_class_value = "fas fa-" + /*icon*/ ctx[5])) {
    				attr(i, "class", i_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (59:4) {#if validated === true }
    function create_if_block_1$9(ctx) {
    	let span;

    	function select_block_type(ctx, dirty) {
    		if (/*valid*/ ctx[8] === true) return create_if_block_2$8;
    		if (/*valid*/ ctx[8] === false) return create_if_block_3$7;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	return {
    		c() {
    			span = element("span");
    			if (if_block) if_block.c();
    			attr(span, "class", "icon is-small is-right");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			if (if_block) if_block.m(span, null);
    		},
    		p(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span, null);
    				}
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};
    }

    // (63:35) 
    function create_if_block_3$7(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-exclamation-triangle");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (61:6) {#if valid === true }
    function create_if_block_2$8(ctx) {
    	let i;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-check");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(i);
    		}
    	};
    }

    // (72:4) {:else}
    function create_else_block$c(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(" ");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (70:4) {#if !(validated && valid) && (inputStarted) }
    function create_if_block$d(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*helper*/ ctx[11]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*helper*/ 2048) set_data(t, /*helper*/ ctx[11]);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$m(ctx) {
    	let div1;
    	let label_1;
    	let t0;
    	let t1;
    	let div0;
    	let input;
    	let input_class_value;
    	let input_aria_controls_value;
    	let input_aria_describedby_value;
    	let t2;
    	let t3;
    	let div0_class_value;
    	let t4;
    	let p;
    	let p_class_value;
    	let p_id_value;
    	let div1_class_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*icon*/ ctx[5] && create_if_block_4$7(ctx);
    	let if_block1 = /*validated*/ ctx[9] === true && create_if_block_1$9(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (!(/*validated*/ ctx[9] && /*valid*/ ctx[8]) && /*inputStarted*/ ctx[0]) return create_if_block$d;
    		return create_else_block$c;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block2 = current_block_type(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			label_1 = element("label");
    			t0 = text(/*label*/ ctx[2]);
    			t1 = space();
    			div0 = element("div");
    			input = element("input");
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			p = element("p");
    			if_block2.c();
    			attr(label_1, "class", "label");
    			attr(input, "class", input_class_value = "input " + /*validationClasses*/ ctx[13]);
    			attr(input, "type", "text");
    			attr(input, "name", /*fieldname*/ ctx[4]);
    			attr(input, "invalid", /*invalid*/ ctx[12]);
    			input.required = /*required*/ ctx[6];
    			attr(input, "placeholder", /*placeholder*/ ctx[3]);
    			attr(input, "autocomplete", /*fieldname*/ ctx[4]);
    			attr(input, "aria-controls", input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			attr(input, "aria-describedby", input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			input.readOnly = /*readonly*/ ctx[7];
    			attr(div0, "class", div0_class_value = "control " + /*iconClasses*/ ctx[10]);
    			attr(p, "class", p_class_value = "help " + /*validationClasses*/ ctx[13]);
    			attr(p, "id", p_id_value = "input-field-helper-" + /*fieldname*/ ctx[4]);
    			attr(div1, "class", div1_class_value = "field form-field-textfield-" + /*fieldname*/ ctx[4]);
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, label_1);
    			append(label_1, t0);
    			append(div1, t1);
    			append(div1, div0);
    			append(div0, input);
    			set_input_value(input, /*value*/ ctx[1]);
    			append(div0, t2);
    			if (if_block0) if_block0.m(div0, null);
    			append(div0, t3);
    			if (if_block1) if_block1.m(div0, null);
    			append(div1, t4);
    			append(div1, p);
    			if_block2.m(p, null);

    			if (!mounted) {
    				dispose = [
    					listen(input, "input", /*input_input_handler*/ ctx[20]),
    					listen(input, "change", /*onBlur*/ ctx[14]),
    					listen(input, "input", /*onInput*/ ctx[15])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*label*/ 4) set_data(t0, /*label*/ ctx[2]);

    			if (dirty & /*validationClasses*/ 8192 && input_class_value !== (input_class_value = "input " + /*validationClasses*/ ctx[13])) {
    				attr(input, "class", input_class_value);
    			}

    			if (dirty & /*fieldname*/ 16) {
    				attr(input, "name", /*fieldname*/ ctx[4]);
    			}

    			if (dirty & /*invalid*/ 4096) {
    				attr(input, "invalid", /*invalid*/ ctx[12]);
    			}

    			if (dirty & /*required*/ 64) {
    				input.required = /*required*/ ctx[6];
    			}

    			if (dirty & /*placeholder*/ 8) {
    				attr(input, "placeholder", /*placeholder*/ ctx[3]);
    			}

    			if (dirty & /*fieldname*/ 16) {
    				attr(input, "autocomplete", /*fieldname*/ ctx[4]);
    			}

    			if (dirty & /*fieldname*/ 16 && input_aria_controls_value !== (input_aria_controls_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(input, "aria-controls", input_aria_controls_value);
    			}

    			if (dirty & /*fieldname*/ 16 && input_aria_describedby_value !== (input_aria_describedby_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(input, "aria-describedby", input_aria_describedby_value);
    			}

    			if (dirty & /*readonly*/ 128) {
    				input.readOnly = /*readonly*/ ctx[7];
    			}

    			if (dirty & /*value*/ 2 && input.value !== /*value*/ ctx[1]) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}

    			if (/*icon*/ ctx[5]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4$7(ctx);
    					if_block0.c();
    					if_block0.m(div0, t3);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*validated*/ ctx[9] === true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$9(ctx);
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*iconClasses*/ 1024 && div0_class_value !== (div0_class_value = "control " + /*iconClasses*/ ctx[10])) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(p, null);
    				}
    			}

    			if (dirty & /*validationClasses*/ 8192 && p_class_value !== (p_class_value = "help " + /*validationClasses*/ ctx[13])) {
    				attr(p, "class", p_class_value);
    			}

    			if (dirty & /*fieldname*/ 16 && p_id_value !== (p_id_value = "input-field-helper-" + /*fieldname*/ ctx[4])) {
    				attr(p, "id", p_id_value);
    			}

    			if (dirty & /*fieldname*/ 16 && div1_class_value !== (div1_class_value = "field form-field-textfield-" + /*fieldname*/ ctx[4])) {
    				attr(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let dispatch = createEventDispatcher();
    	let { inputStarted = false } = $$props;

    	let { validator = () => {
    		return true;
    	} } = $$props;

    	let { value = "" } = $$props;
    	let { label = "textfield" } = $$props;
    	let { placeholder = "input some text here, please" } = $$props;
    	let { fieldname = "textfield" } = $$props;
    	let { icon = false } = $$props;
    	let { required = true } = $$props;
    	let { readonly = false } = $$props;
    	let { valid = true } = $$props;
    	let { validated = false } = $$props;
    	let { errors = false } = $$props;
    	let { formErrors = false } = $$props;
    	let { formLevelError = false } = $$props;

    	function onBlur(ev) {
    		let data = {
    			field: fieldname,
    			value: ev.target.type === "checkbox"
    			? ev.target.checked
    			: ev.target.value
    		};

    		$$invalidate(0, inputStarted = true);
    		dispatch("change", data);
    		return true;
    	}

    	function onInput(ev) {
    		let data = { field: fieldname, value };
    		$$invalidate(0, inputStarted = true);
    		dispatch("change", data);
    		return true;
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	$$self.$set = $$props => {
    		if ("inputStarted" in $$props) $$invalidate(0, inputStarted = $$props.inputStarted);
    		if ("validator" in $$props) $$invalidate(16, validator = $$props.validator);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("label" in $$props) $$invalidate(2, label = $$props.label);
    		if ("placeholder" in $$props) $$invalidate(3, placeholder = $$props.placeholder);
    		if ("fieldname" in $$props) $$invalidate(4, fieldname = $$props.fieldname);
    		if ("icon" in $$props) $$invalidate(5, icon = $$props.icon);
    		if ("required" in $$props) $$invalidate(6, required = $$props.required);
    		if ("readonly" in $$props) $$invalidate(7, readonly = $$props.readonly);
    		if ("valid" in $$props) $$invalidate(8, valid = $$props.valid);
    		if ("validated" in $$props) $$invalidate(9, validated = $$props.validated);
    		if ("errors" in $$props) $$invalidate(17, errors = $$props.errors);
    		if ("formErrors" in $$props) $$invalidate(18, formErrors = $$props.formErrors);
    		if ("formLevelError" in $$props) $$invalidate(19, formLevelError = $$props.formLevelError);
    	};

    	let iconClasses;
    	let allErrors;
    	let helper;
    	let invalid;
    	let validationClasses;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 32) {
    			 $$invalidate(10, iconClasses = (icon ? " has-icons-left " : "") + " has-icons-right ");
    		}

    		if ($$self.$$.dirty & /*errors, formErrors*/ 393216) {
    			 $$invalidate(21, allErrors = [].concat(errors ? errors : [], formErrors ? formErrors : []));
    		}

    		if ($$self.$$.dirty & /*allErrors, placeholder*/ 2097160) {
    			 $$invalidate(11, helper = allErrors ? allErrors.join(", ") : placeholder);
    		}

    		if ($$self.$$.dirty & /*valid, formLevelError*/ 524544) {
    			 $$invalidate(12, invalid = valid === false || formLevelError);
    		}

    		if ($$self.$$.dirty & /*valid, inputStarted*/ 257) {
    			 $$invalidate(13, validationClasses = valid === true || !inputStarted ? CLASS_OK : CLASS_ERR);
    		}
    	};

    	return [
    		inputStarted,
    		value,
    		label,
    		placeholder,
    		fieldname,
    		icon,
    		required,
    		readonly,
    		valid,
    		validated,
    		iconClasses,
    		helper,
    		invalid,
    		validationClasses,
    		onBlur,
    		onInput,
    		validator,
    		errors,
    		formErrors,
    		formLevelError,
    		input_input_handler
    	];
    }

    class Ui_textfield extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {
    			inputStarted: 0,
    			validator: 16,
    			value: 1,
    			label: 2,
    			placeholder: 3,
    			fieldname: 4,
    			icon: 5,
    			required: 6,
    			readonly: 7,
    			valid: 8,
    			validated: 9,
    			errors: 17,
    			formErrors: 18,
    			formLevelError: 19
    		});
    	}
    }

    var FormElements = /*#__PURE__*/Object.freeze({
        __proto__: null,
        UICheckbox: Ui_checkbox,
        UIColor: Ui_color,
        UIDate: Ui_date,
        UIEmail: Ui_email,
        UIHidden: Ui_hidden,
        UIPassword: Ui_password,
        UIRadio: Ui_radio,
        UIRadiogroup: Ui_radiogroup,
        UIRange: Ui_range,
        UISelect: Ui_select,
        UISlider: Ui_slider,
        UISwitch: Ui_switch,
        UITelephone: Ui_telephone,
        UITextarea: Ui_textarea,
        UITextfield: Ui_textfield
    });

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    var ALL = {};

    function exist(key) {
      return Object.prototype.hasOwnProperty.call(ALL, key);
    }

    function get(key) {
      if (exist(key)) {
        return ALL[key];
      } else {
        return false;
      }
    }

    function create(key) {
      var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
        'raw': [],
        'filtered': []
      };

      if (!exist(key)) {
        if (Object.keys(props).length > 0) {
          ALL[key] = {};
          Object.keys(props).forEach(function (name) {
            ALL[key][name] = writable(props[name]);
          });
        } else {
          throw new Error('store\'s props wasn\'t specified');
        }
      }

      return ALL[key];
    }

    var notTable_stores = /*#__PURE__*/Object.freeze({
        __proto__: null,
        create: create,
        get: get
    });

    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;

      for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    }

    var arrayLikeToArray = _arrayLikeToArray;

    function _arrayWithoutHoles(arr) {
      if (Array.isArray(arr)) return arrayLikeToArray(arr);
    }

    var arrayWithoutHoles = _arrayWithoutHoles;

    function _iterableToArray(iter) {
      if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
    }

    var iterableToArray = _iterableToArray;

    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
    }

    var unsupportedIterableToArray = _unsupportedIterableToArray;

    function _nonIterableSpread() {
      throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var nonIterableSpread = _nonIterableSpread;

    function _toConsumableArray(arr) {
      return arrayWithoutHoles(arr) || iterableToArray(arr) || unsupportedIterableToArray(arr) || nonIterableSpread();
    }

    var toConsumableArray = _toConsumableArray;

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    var classCallCheck = _classCallCheck;

    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      return Constructor;
    }

    var createClass = _createClass;

    function _assertThisInitialized(self) {
      if (self === void 0) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }

      return self;
    }

    var assertThisInitialized = _assertThisInitialized;

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var setPrototypeOf = createCommonjsModule(function (module) {
    function _setPrototypeOf(o, p) {
      module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
      };

      return _setPrototypeOf(o, p);
    }

    module.exports = _setPrototypeOf;
    });

    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function");
      }

      subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
          value: subClass,
          writable: true,
          configurable: true
        }
      });
      if (superClass) setPrototypeOf(subClass, superClass);
    }

    var inherits = _inherits;

    var _typeof_1 = createCommonjsModule(function (module) {
    function _typeof(obj) {
      "@babel/helpers - typeof";

      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        module.exports = _typeof = function _typeof(obj) {
          return typeof obj;
        };
      } else {
        module.exports = _typeof = function _typeof(obj) {
          return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
      }

      return _typeof(obj);
    }

    module.exports = _typeof;
    });

    function _possibleConstructorReturn(self, call) {
      if (call && (_typeof_1(call) === "object" || typeof call === "function")) {
        return call;
      }

      return assertThisInitialized(self);
    }

    var possibleConstructorReturn = _possibleConstructorReturn;

    var getPrototypeOf = createCommonjsModule(function (module) {
    function _getPrototypeOf(o) {
      module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
      };
      return _getPrototypeOf(o);
    }

    module.exports = _getPrototypeOf;
    });

    var EventEmitter = createCommonjsModule(function (module) {
    (function (exports) {

        /**
         * Class for managing events.
         * Can be extended to provide event functionality in other classes.
         *
         * @class EventEmitter Manages event registering and emitting.
         */
        function EventEmitter() {}

        // Shortcuts to improve speed and size
        var proto = EventEmitter.prototype;
        var originalGlobalValue = exports.EventEmitter;

        /**
         * Finds the index of the listener for the event in its storage array.
         *
         * @param {Function[]} listeners Array of listeners to search through.
         * @param {Function} listener Method to look for.
         * @return {Number} Index of the specified listener, -1 if not found
         * @api private
         */
        function indexOfListener(listeners, listener) {
            var i = listeners.length;
            while (i--) {
                if (listeners[i].listener === listener) {
                    return i;
                }
            }

            return -1;
        }

        /**
         * Alias a method while keeping the context correct, to allow for overwriting of target method.
         *
         * @param {String} name The name of the target method.
         * @return {Function} The aliased method
         * @api private
         */
        function alias(name) {
            return function aliasClosure() {
                return this[name].apply(this, arguments);
            };
        }

        /**
         * Returns the listener array for the specified event.
         * Will initialise the event object and listener arrays if required.
         * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
         * Each property in the object response is an array of listener functions.
         *
         * @param {String|RegExp} evt Name of the event to return the listeners from.
         * @return {Function[]|Object} All listener functions for the event.
         */
        proto.getListeners = function getListeners(evt) {
            var events = this._getEvents();
            var response;
            var key;

            // Return a concatenated array of all matching events if
            // the selector is a regular expression.
            if (evt instanceof RegExp) {
                response = {};
                for (key in events) {
                    if (events.hasOwnProperty(key) && evt.test(key)) {
                        response[key] = events[key];
                    }
                }
            }
            else {
                response = events[evt] || (events[evt] = []);
            }

            return response;
        };

        /**
         * Takes a list of listener objects and flattens it into a list of listener functions.
         *
         * @param {Object[]} listeners Raw listener objects.
         * @return {Function[]} Just the listener functions.
         */
        proto.flattenListeners = function flattenListeners(listeners) {
            var flatListeners = [];
            var i;

            for (i = 0; i < listeners.length; i += 1) {
                flatListeners.push(listeners[i].listener);
            }

            return flatListeners;
        };

        /**
         * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
         *
         * @param {String|RegExp} evt Name of the event to return the listeners from.
         * @return {Object} All listener functions for an event in an object.
         */
        proto.getListenersAsObject = function getListenersAsObject(evt) {
            var listeners = this.getListeners(evt);
            var response;

            if (listeners instanceof Array) {
                response = {};
                response[evt] = listeners;
            }

            return response || listeners;
        };

        function isValidListener (listener) {
            if (typeof listener === 'function' || listener instanceof RegExp) {
                return true
            } else if (listener && typeof listener === 'object') {
                return isValidListener(listener.listener)
            } else {
                return false
            }
        }

        /**
         * Adds a listener function to the specified event.
         * The listener will not be added if it is a duplicate.
         * If the listener returns true then it will be removed after it is called.
         * If you pass a regular expression as the event name then the listener will be added to all events that match it.
         *
         * @param {String|RegExp} evt Name of the event to attach the listener to.
         * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.addListener = function addListener(evt, listener) {
            if (!isValidListener(listener)) {
                throw new TypeError('listener must be a function');
            }

            var listeners = this.getListenersAsObject(evt);
            var listenerIsWrapped = typeof listener === 'object';
            var key;

            for (key in listeners) {
                if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
                    listeners[key].push(listenerIsWrapped ? listener : {
                        listener: listener,
                        once: false
                    });
                }
            }

            return this;
        };

        /**
         * Alias of addListener
         */
        proto.on = alias('addListener');

        /**
         * Semi-alias of addListener. It will add a listener that will be
         * automatically removed after its first execution.
         *
         * @param {String|RegExp} evt Name of the event to attach the listener to.
         * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.addOnceListener = function addOnceListener(evt, listener) {
            return this.addListener(evt, {
                listener: listener,
                once: true
            });
        };

        /**
         * Alias of addOnceListener.
         */
        proto.once = alias('addOnceListener');

        /**
         * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
         * You need to tell it what event names should be matched by a regex.
         *
         * @param {String} evt Name of the event to create.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.defineEvent = function defineEvent(evt) {
            this.getListeners(evt);
            return this;
        };

        /**
         * Uses defineEvent to define multiple events.
         *
         * @param {String[]} evts An array of event names to define.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.defineEvents = function defineEvents(evts) {
            for (var i = 0; i < evts.length; i += 1) {
                this.defineEvent(evts[i]);
            }
            return this;
        };

        /**
         * Removes a listener function from the specified event.
         * When passed a regular expression as the event name, it will remove the listener from all events that match it.
         *
         * @param {String|RegExp} evt Name of the event to remove the listener from.
         * @param {Function} listener Method to remove from the event.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.removeListener = function removeListener(evt, listener) {
            var listeners = this.getListenersAsObject(evt);
            var index;
            var key;

            for (key in listeners) {
                if (listeners.hasOwnProperty(key)) {
                    index = indexOfListener(listeners[key], listener);

                    if (index !== -1) {
                        listeners[key].splice(index, 1);
                    }
                }
            }

            return this;
        };

        /**
         * Alias of removeListener
         */
        proto.off = alias('removeListener');

        /**
         * Adds listeners in bulk using the manipulateListeners method.
         * If you pass an object as the first argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
         * You can also pass it a regular expression to add the array of listeners to all events that match it.
         * Yeah, this function does quite a bit. That's probably a bad thing.
         *
         * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
         * @param {Function[]} [listeners] An optional array of listener functions to add.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.addListeners = function addListeners(evt, listeners) {
            // Pass through to manipulateListeners
            return this.manipulateListeners(false, evt, listeners);
        };

        /**
         * Removes listeners in bulk using the manipulateListeners method.
         * If you pass an object as the first argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
         * You can also pass it an event name and an array of listeners to be removed.
         * You can also pass it a regular expression to remove the listeners from all events that match it.
         *
         * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
         * @param {Function[]} [listeners] An optional array of listener functions to remove.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.removeListeners = function removeListeners(evt, listeners) {
            // Pass through to manipulateListeners
            return this.manipulateListeners(true, evt, listeners);
        };

        /**
         * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
         * The first argument will determine if the listeners are removed (true) or added (false).
         * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
         * You can also pass it an event name and an array of listeners to be added/removed.
         * You can also pass it a regular expression to manipulate the listeners of all events that match it.
         *
         * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
         * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
         * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
            var i;
            var value;
            var single = remove ? this.removeListener : this.addListener;
            var multiple = remove ? this.removeListeners : this.addListeners;

            // If evt is an object then pass each of its properties to this method
            if (typeof evt === 'object' && !(evt instanceof RegExp)) {
                for (i in evt) {
                    if (evt.hasOwnProperty(i) && (value = evt[i])) {
                        // Pass the single listener straight through to the singular method
                        if (typeof value === 'function') {
                            single.call(this, i, value);
                        }
                        else {
                            // Otherwise pass back to the multiple function
                            multiple.call(this, i, value);
                        }
                    }
                }
            }
            else {
                // So evt must be a string
                // And listeners must be an array of listeners
                // Loop over it and pass each one to the multiple method
                i = listeners.length;
                while (i--) {
                    single.call(this, evt, listeners[i]);
                }
            }

            return this;
        };

        /**
         * Removes all listeners from a specified event.
         * If you do not specify an event then all listeners will be removed.
         * That means every event will be emptied.
         * You can also pass a regex to remove all events that match it.
         *
         * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.removeEvent = function removeEvent(evt) {
            var type = typeof evt;
            var events = this._getEvents();
            var key;

            // Remove different things depending on the state of evt
            if (type === 'string') {
                // Remove all listeners for the specified event
                delete events[evt];
            }
            else if (evt instanceof RegExp) {
                // Remove all events matching the regex.
                for (key in events) {
                    if (events.hasOwnProperty(key) && evt.test(key)) {
                        delete events[key];
                    }
                }
            }
            else {
                // Remove all listeners in all events
                delete this._events;
            }

            return this;
        };

        /**
         * Alias of removeEvent.
         *
         * Added to mirror the node API.
         */
        proto.removeAllListeners = alias('removeEvent');

        /**
         * Emits an event of your choice.
         * When emitted, every listener attached to that event will be executed.
         * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
         * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
         * So they will not arrive within the array on the other side, they will be separate.
         * You can also pass a regular expression to emit to all events that match it.
         *
         * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
         * @param {Array} [args] Optional array of arguments to be passed to each listener.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.emitEvent = function emitEvent(evt, args) {
            var listenersMap = this.getListenersAsObject(evt);
            var listeners;
            var listener;
            var i;
            var key;
            var response;

            for (key in listenersMap) {
                if (listenersMap.hasOwnProperty(key)) {
                    listeners = listenersMap[key].slice(0);

                    for (i = 0; i < listeners.length; i++) {
                        // If the listener returns true then it shall be removed from the event
                        // The function is executed either with a basic call or an apply if there is an args array
                        listener = listeners[i];

                        if (listener.once === true) {
                            this.removeListener(evt, listener.listener);
                        }

                        response = listener.listener.apply(this, args || []);

                        if (response === this._getOnceReturnValue()) {
                            this.removeListener(evt, listener.listener);
                        }
                    }
                }
            }

            return this;
        };

        /**
         * Alias of emitEvent
         */
        proto.trigger = alias('emitEvent');

        /**
         * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
         * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
         *
         * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
         * @param {...*} Optional additional arguments to be passed to each listener.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.emit = function emit(evt) {
            var args = Array.prototype.slice.call(arguments, 1);
            return this.emitEvent(evt, args);
        };

        /**
         * Sets the current value to check against when executing listeners. If a
         * listeners return value matches the one set here then it will be removed
         * after execution. This value defaults to true.
         *
         * @param {*} value The new value to check for when executing listeners.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.setOnceReturnValue = function setOnceReturnValue(value) {
            this._onceReturnValue = value;
            return this;
        };

        /**
         * Fetches the current value to check against when executing listeners. If
         * the listeners return value matches this one then it should be removed
         * automatically. It will return true by default.
         *
         * @return {*|Boolean} The current value to check for or the default, true.
         * @api private
         */
        proto._getOnceReturnValue = function _getOnceReturnValue() {
            if (this.hasOwnProperty('_onceReturnValue')) {
                return this._onceReturnValue;
            }
            else {
                return true;
            }
        };

        /**
         * Fetches the events object and creates one if required.
         *
         * @return {Object} The events storage object.
         * @api private
         */
        proto._getEvents = function _getEvents() {
            return this._events || (this._events = {});
        };

        /**
         * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
         *
         * @return {Function} Non conflicting EventEmitter class.
         */
        EventEmitter.noConflict = function noConflict() {
            exports.EventEmitter = originalGlobalValue;
            return EventEmitter;
        };

        // Expose the class either via AMD, CommonJS or the global object
        if ( module.exports){
            module.exports = EventEmitter;
        }
        else {
            exports.EventEmitter = EventEmitter;
        }
    }(typeof window !== 'undefined' ? window : commonjsGlobal || {}));
    });

    /*
    	:property.sub1.func().funcProp
    	 = return funcProp of function result of sub1 property of property of object
    	:{::helperVal}.sub
    	 = return sub property of object property with name retrieved from helperVal property of helpers object
    	:{::helperFunc()}.sub
    	= return sub property of object property with name retrieved from helperVal function result of helpers object.
    	if helpersFunx return 'car' then source path becomes :car.sub

    */

    const SUB_PATH_START = '{',
    	SUB_PATH_END = '}',
    	PATH_SPLIT = '.',
    	PATH_START_OBJECT = ':',
    	PATH_START_HELPERS = '::',
    	FUNCTION_MARKER = '()',
    	MAX_DEEP = 10;

    /**
     * Set of tools to use notPath property access notation
     * : is for item
     * :: is for helpers
     * {} subpath
     * . path splitter
     * () function and should be executed with params (item, helper | undefined)
     * sub-paths will be parsed and replaced by results in source path
     */
    class notPath {
    	constructor() {
    		return this;
    	}
    	/*
    		input ':{::helperVal}.sub'
    		return ::helperVal
    	*/

    	/**
    	 * Returns first subpath in path
    	 * if subpath not closed will return it anyway
    	 * @param {string} path path in string notation
    	 * @return {string|null} subpath or null if no sub path were found
    	 */
    	findNextSubPath(path) {
    		let subPath = '',
    			find = false;
    		for (let i = 0; i < path.length; i++) {
    			if (path[i] === SUB_PATH_START) {
    				find = true;
    				subPath = '';
    			} else {
    				if ((path[i] === SUB_PATH_END) && find) {
    					return subPath;
    				} else {
    					subPath += path[i];
    				}
    			}
    		}
    		return find ? subPath : null;
    	}

    	/**
    	 * Replace sub-path in parent path by parsed version
    	 * @param {string} path path to process
    	 * @param {string} sub sub path to replace
    	 * @param {string} parsed parsed sub path
    	 * @return {string} parsed path
    	 */

    	replaceSubPath(path, sub, parsed) {
    		let subf = SUB_PATH_START + sub + SUB_PATH_END,
    			i = 0;
    		while ((path.indexOf(subf) > -1) && i < MAX_DEEP) {
    			path = path.replace(subf, parsed);
    			i++;
    		}
    		return path;
    	}

    	/**
    	 * Parses path while there any sub-paths
    	 * @param {string} path raw unparsed path
    	 * @param {object} item data
    	 * @param {object} helpers helpers
    	 * @return {string} parsed path
    	 */
    	parseSubs(path, item, helpers) {
    		let subPath = this.findNextSubPath(path),
    			subPathParsed, i = 0;
    		while (subPath) {
    			subPathParsed = this.getValueByPath(subPath.indexOf(PATH_START_HELPERS) > -1 ? helpers : item, subPath, item, helpers);
    			path = this.replaceSubPath(path, subPath, subPathParsed);
    			i++;
    			if (i > MAX_DEEP) {
    				break;
    			}
    			subPath = this.findNextSubPath(path);
    		}
    		return path;
    	}

    	/**
    	 * Get property value
    	 * @param {string} path path to property
    	 * @param {object} item item object
    	 * @param {object} helpers helpers object
    	 */

    	get(path, item, helpers) {
    		switch (path) {
    		case PATH_START_OBJECT:
    			return item;
    		case PATH_START_HELPERS:
    			return helpers;
    		}
    		path = this.parseSubs(path, item, helpers);
    		return this.getValueByPath(path.indexOf(PATH_START_HELPERS) > -1 ? helpers : item, path, item, helpers);
    	}

    	/**
    	 * Set property value
    	 * @param {string} path path to property
    	 * @param {object} item item object
    	 * @param {object} helpers helpers object
    	 * @param {any} attrValue value we want to assign
    	 */

    	set(path, item, helpers, attrValue) {
    		if (arguments.length === 3) {
    			attrValue = helpers;
    			helpers = undefined;
    		}
    		let subPath = this.findNextSubPath(path),
    			subPathParsed,
    			i = 0;
    		while (subPath) {

    			subPathParsed = this.getValueByPath(subPath.indexOf(PATH_START_HELPERS) > -1 ? helpers : item, subPath, item, helpers);

    			path = this.replaceSubPath(path, subPath, subPathParsed);

    			if (i > MAX_DEEP) {
    				break;
    			}
    			subPath = this.findNextSubPath(path);
    			i++;
    		}

    		this.setValueByPath(item, path, attrValue);

    		if (item.isRecord && this.normilizePath(path).length > 1 && item.__isActive) {
    			item.trigger('change', item, path, attrValue);
    		}
    	}

    	/**
    	 * Set target property to null
    	 * @param {string} path path to property
    	 * @param {object} item item object
    	 * @param {object} helpers helpers object
    	 */

    	unset(path, item, helpers) {
    		this.set(path, item, helpers, null);
    	}

    	/**
    	 * Parses step key, transforms it to end-form
    	 * @param {string} step not parsed step key
    	 * @param {object} item item object
    	 * @param {object} helper helpers object
    	 * @return {string|number} parsed step key
    	 */

    	parsePathStep(step, item, helper) {
    		let rStep = null;
    		if (step.indexOf(PATH_START_HELPERS) === 0 && helper) {
    			rStep = step.replace(PATH_START_HELPERS, '');
    			if (rStep.indexOf(FUNCTION_MARKER) === rStep.length - 2) {
    				rStep = rStep.replace(FUNCTION_MARKER, '');
    				if (helper.hasOwnProperty(rStep)) {
    					return helper[rStep](item, undefined);
    				}
    			} else {
    				return helper[rStep];
    			}
    		} else {
    			if (step.indexOf(PATH_START_OBJECT) === 0 && item) {
    				rStep = step.replace(PATH_START_OBJECT, '');
    				if (rStep.indexOf(FUNCTION_MARKER) === rStep.length - 2) {
    					rStep = rStep.replace(FUNCTION_MARKER, '');
    					if (item.hasOwnProperty(rStep)) {
    						return item[rStep](item, undefined);
    					}
    				} else {
    					return item[rStep];
    				}
    			}
    		}
    		return step;
    	}

    	//::fieldName.result
    	//{}
    	//{fieldName: 'targetRecordField'}
    	////['targetRecordField', 'result']
    	/**
    	 * Transforms path with sub paths to path without
    	 * @param {string|array} path path to target property
    	 * @param {object} item item object
    	 * @param {object} helper helper object
    	 * @return {array} parsed path
    	 **/
    	parsePath(path, item, helper) {
    		if (!Array.isArray(path)) {
    			path = path.split(PATH_SPLIT);
    		}
    		for (var i = 0; i < path.length; i++) {
    			path[i] = this.parsePathStep(path[i], item, helper);
    		}
    		return path;
    	}

    	/**
    	 * Transforms path from string notation to array of keys
    	 * @param {string|array} path  input path, if array does nothing
    	 * @return {array} path in array notation
    	 */

    	normilizePath(path) {
    		if (Array.isArray(path)) {
    			return path;
    		} else {
    			while (path.indexOf(PATH_START_OBJECT) > -1) {
    				path = path.replace(PATH_START_OBJECT, '');
    			}
    			return path.split(PATH_SPLIT);
    		}
    	}

    	/*
    		small = ["todo"],
    		big = ["todo", "length"]
    		return true;

    	*/

    	/**
    	 * Identifies if first path includes second, compared from start,
    	 * no floating start position inside ['join', 'me'], ['me']
    	 * will result in false
    	 * @param {array} big where we will search
    	 * @param {array} small what we will search
    	 * @return {boolean} if we succeed
    	 */

    	ifFullSubPath(big, small) {
    		if (big.length < small.length) {
    			return false;
    		}
    		for (let t = 0; t < small.length; t++) {
    			if (small[t] !== big[t]) {
    				return false;
    			}
    		}
    		return true;
    	}

    	/**
    	 * Getter through third object
    	 * Path is parsed, no event triggering for notRecord
    	 * @param {object} object object to be used as getter
    	 * @param {string|array} attrPath path to property
    	 * @param {object} item supporting data
    	 * @param {helpers} object  supporting helpers
    	 */

    	getValueByPath(object, attrPath, item, helpers) {
    		attrPath = this.normilizePath(attrPath);
    		let attrName = attrPath.shift(),
    			isFunction = attrName.indexOf(FUNCTION_MARKER) > -1;
    		if (isFunction) {
    			attrName = attrName.replace(FUNCTION_MARKER, '');
    		}
    		if ((typeof object === 'object' && typeof object !== 'undefined' && object!== null) && typeof object[attrName] !== 'undefined' && object[attrName] !== null) {
    			let newObj = isFunction ? object[attrName]({
    				item,
    				helpers
    			}) : object[attrName];
    			if (attrPath.length > 0) {
    				return this.getValueByPath(newObj, attrPath, item, helpers);
    			} else {
    				return newObj;
    			}
    		} else {
    			return undefined;
    		}
    	}

    	/**
    	 * Setter through third object
    	 * Path is parsed, no event triggering for notRecord
    	 * @param {object} object object to be modified
    	 * @param {string|array} attrPath path to property
    	 * @param {any} attrValue  value to assign
    	 */

    	setValueByPath(object, attrPath, attrValue) {
    		attrPath = this.normilizePath(attrPath);
    		let attrName = attrPath.shift();
    		if (attrPath.length > 0) {
    			if (!object.hasOwnProperty(attrName)) {
    				object[attrName] = {};
    			}
    			this.setValueByPath(object[attrName], attrPath, attrValue);
    		} else {
    			object[attrName] = attrValue;
    		}
    	}

    	/**
    	* Joins passed in strings with PATH_SPLIT
    	* @param {string} arguments path to be glued
    	* @return {string} composite path
    	*/

    	join() {
    		let args = Array.prototype.slice.call(arguments);
    		return args.join(PATH_SPLIT);
    	}
    }

    var src = new notPath();

    var notPath$1 = src;

    /* src/table/notTable.svelte generated by Svelte v3.23.2 */

    function get_each_context$9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    // (64:0) {#if links.length}
    function create_if_block_8$1(ctx) {
    	let div;
    	let tablelinks;
    	let current;
    	tablelinks = new Ui_links({ props: { values: /*links*/ ctx[6] } });

    	return {
    		c() {
    			div = element("div");
    			create_component(tablelinks.$$.fragment);
    			attr(div, "class", "field is-grouped");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(tablelinks, div, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const tablelinks_changes = {};
    			if (dirty & /*links*/ 64) tablelinks_changes.values = /*links*/ ctx[6];
    			tablelinks.$set(tablelinks_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(tablelinks.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(tablelinks.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(tablelinks);
    		}
    	};
    }

    // (69:0) {#if actions.length}
    function create_if_block_7$1(ctx) {
    	let div;
    	let tablebuttons;
    	let current;
    	tablebuttons = new Ui_buttons({ props: { values: /*actions*/ ctx[5] } });

    	return {
    		c() {
    			div = element("div");
    			create_component(tablebuttons.$$.fragment);
    			attr(div, "class", "field is-grouped");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(tablebuttons, div, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const tablebuttons_changes = {};
    			if (dirty & /*actions*/ 32) tablebuttons_changes.values = /*actions*/ ctx[5];
    			tablebuttons.$set(tablebuttons_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(tablebuttons.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(tablebuttons.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(tablebuttons);
    		}
    	};
    }

    // (74:0) {#if showSearch }
    function create_if_block_6$1(ctx) {
    	let div1;
    	let div0;
    	let input;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			input = element("input");
    			attr(input, "class", "input");
    			attr(input, "type", "text");
    			attr(input, "placeholder", "Поиск");
    			attr(div0, "class", "control");
    			attr(div1, "class", "field");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, input);
    			set_input_value(input, /*search*/ ctx[2]);

    			if (!mounted) {
    				dispose = [
    					listen(input, "input", /*input_input_handler*/ ctx[13]),
    					listen(input, "input", /*onSearchInput*/ ctx[8])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*search*/ 4 && input.value !== /*search*/ ctx[2]) {
    				set_input_value(input, /*search*/ ctx[2]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (83:2) {#each fields as field}
    function create_each_block_3(ctx) {
    	let th;
    	let t_value = /*field*/ ctx[22].title + "";
    	let t;

    	return {
    		c() {
    			th = element("th");
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, th, anchor);
    			append(th, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*fields*/ 16 && t_value !== (t_value = /*field*/ ctx[22].title + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(th);
    		}
    	};
    }

    // (100:4) {:else}
    function create_else_block_1$2(ctx) {
    	let t_value = notPath$1.get(/*field*/ ctx[22].path, /*item*/ ctx[19], /*helpers*/ ctx[3]) + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*fields, items, helpers*/ 26 && t_value !== (t_value = notPath$1.get(/*field*/ ctx[22].path, /*item*/ ctx[19], /*helpers*/ ctx[3]) + "")) set_data(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (98:40) 
    function create_if_block_5$1(ctx) {
    	let tablebooleans;
    	let current;

    	tablebooleans = new Ui_booleans({
    			props: {
    				values: notPath$1.get(/*field*/ ctx[22].path, /*item*/ ctx[19], /*helpers*/ ctx[3])
    			}
    		});

    	return {
    		c() {
    			create_component(tablebooleans.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(tablebooleans, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const tablebooleans_changes = {};
    			if (dirty & /*fields, items, helpers*/ 26) tablebooleans_changes.values = notPath$1.get(/*field*/ ctx[22].path, /*item*/ ctx[19], /*helpers*/ ctx[3]);
    			tablebooleans.$set(tablebooleans_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(tablebooleans.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(tablebooleans.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(tablebooleans, detaching);
    		}
    	};
    }

    // (96:38) 
    function create_if_block_4$8(ctx) {
    	let tableimages;
    	let current;

    	tableimages = new Ui_images({
    			props: {
    				values: notPath$1.get(/*field*/ ctx[22].path, /*item*/ ctx[19], /*helpers*/ ctx[3])
    			}
    		});

    	return {
    		c() {
    			create_component(tableimages.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(tableimages, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const tableimages_changes = {};
    			if (dirty & /*fields, items, helpers*/ 26) tableimages_changes.values = notPath$1.get(/*field*/ ctx[22].path, /*item*/ ctx[19], /*helpers*/ ctx[3]);
    			tableimages.$set(tableimages_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(tableimages.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(tableimages.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(tableimages, detaching);
    		}
    	};
    }

    // (94:39) 
    function create_if_block_3$8(ctx) {
    	let tablebuttons;
    	let current;

    	tablebuttons = new Ui_buttons({
    			props: {
    				values: notPath$1.get(/*field*/ ctx[22].path, /*item*/ ctx[19], /*helpers*/ ctx[3])
    			}
    		});

    	return {
    		c() {
    			create_component(tablebuttons.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(tablebuttons, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const tablebuttons_changes = {};
    			if (dirty & /*fields, items, helpers*/ 26) tablebuttons_changes.values = notPath$1.get(/*field*/ ctx[22].path, /*item*/ ctx[19], /*helpers*/ ctx[3]);
    			tablebuttons.$set(tablebuttons_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(tablebuttons.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(tablebuttons.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(tablebuttons, detaching);
    		}
    	};
    }

    // (92:4) {#if field.type === 'link' }
    function create_if_block_2$9(ctx) {
    	let tablelinks;
    	let current;

    	tablelinks = new Ui_links({
    			props: {
    				values: notPath$1.get(/*field*/ ctx[22].path, /*item*/ ctx[19], /*helpers*/ ctx[3])
    			}
    		});

    	return {
    		c() {
    			create_component(tablelinks.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(tablelinks, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const tablelinks_changes = {};
    			if (dirty & /*fields, items, helpers*/ 26) tablelinks_changes.values = notPath$1.get(/*field*/ ctx[22].path, /*item*/ ctx[19], /*helpers*/ ctx[3]);
    			tablelinks.$set(tablelinks_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(tablelinks.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(tablelinks.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(tablelinks, detaching);
    		}
    	};
    }

    // (90:3) {#each fields as field}
    function create_each_block_2(ctx) {
    	let td;
    	let current_block_type_index;
    	let if_block;
    	let current;

    	const if_block_creators = [
    		create_if_block_2$9,
    		create_if_block_3$8,
    		create_if_block_4$8,
    		create_if_block_5$1,
    		create_else_block_1$2
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*field*/ ctx[22].type === "link") return 0;
    		if (/*field*/ ctx[22].type === "button") return 1;
    		if (/*field*/ ctx[22].type === "image") return 2;
    		if (/*field*/ ctx[22].type === "boolean") return 3;
    		return 4;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			td = element("td");
    			if_block.c();
    		},
    		m(target, anchor) {
    			insert(target, td, anchor);
    			if_blocks[current_block_type_index].m(td, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(td, null);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(td);
    			if_blocks[current_block_type_index].d();
    		}
    	};
    }

    // (88:2) {#each items as item (item._id)}
    function create_each_block_1$2(key_1, ctx) {
    	let tr;
    	let t;
    	let current;
    	let each_value_2 = /*fields*/ ctx[4];
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			this.first = tr;
    		},
    		m(target, anchor) {
    			insert(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append(tr, t);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty & /*notPath, fields, items, helpers*/ 26) {
    				each_value_2 = /*fields*/ ctx[4];
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tr, t);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (113:2) {#if state.pagination && state.pagination.pages && state.pagination.pages.list }
    function create_if_block$e(ctx) {
    	let each_1_anchor;
    	let each_value = /*state*/ ctx[0].pagination.pages.list;
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$9(get_each_context$9(ctx, each_value, i));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*state, goTo*/ 2049) {
    				each_value = /*state*/ ctx[0].pagination.pages.list;
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$9(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$9(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    // (118:3) {:else}
    function create_else_block$d(ctx) {
    	let a;
    	let t_value = /*page*/ ctx[16].index + 1 + "";
    	let t;
    	let a_aria_label_value;
    	let a_data_page_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			a = element("a");
    			t = text(t_value);
    			attr(a, "class", "pagination-link");
    			attr(a, "aria-label", a_aria_label_value = "Страница " + /*page*/ ctx[16].index);
    			attr(a, "data-page", a_data_page_value = /*page*/ ctx[16].index);
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);
    			append(a, t);

    			if (!mounted) {
    				dispose = listen(a, "click", /*goTo*/ ctx[11]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*state*/ 1 && t_value !== (t_value = /*page*/ ctx[16].index + 1 + "")) set_data(t, t_value);

    			if (dirty & /*state*/ 1 && a_aria_label_value !== (a_aria_label_value = "Страница " + /*page*/ ctx[16].index)) {
    				attr(a, "aria-label", a_aria_label_value);
    			}

    			if (dirty & /*state*/ 1 && a_data_page_value !== (a_data_page_value = /*page*/ ctx[16].index)) {
    				attr(a, "data-page", a_data_page_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(a);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (116:3) {#if page.active}
    function create_if_block_1$a(ctx) {
    	let a;
    	let t_value = /*page*/ ctx[16].index + 1 + "";
    	let t;
    	let a_aria_label_value;

    	return {
    		c() {
    			a = element("a");
    			t = text(t_value);
    			attr(a, "class", "pagination-link is-current");
    			attr(a, "aria-label", a_aria_label_value = "Страница " + /*page*/ ctx[16].index);
    			attr(a, "aria-current", "page");
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);
    			append(a, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*state*/ 1 && t_value !== (t_value = /*page*/ ctx[16].index + 1 + "")) set_data(t, t_value);

    			if (dirty & /*state*/ 1 && a_aria_label_value !== (a_aria_label_value = "Страница " + /*page*/ ctx[16].index)) {
    				attr(a, "aria-label", a_aria_label_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(a);
    		}
    	};
    }

    // (114:2) {#each state.pagination.pages.list as page}
    function create_each_block$9(ctx) {
    	let li;
    	let t;

    	function select_block_type_1(ctx, dirty) {
    		if (/*page*/ ctx[16].active) return create_if_block_1$a;
    		return create_else_block$d;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			li = element("li");
    			if_block.c();
    			t = space();
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			if_block.m(li, null);
    			append(li, t);
    		},
    		p(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(li, t);
    				}
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			if_block.d();
    		}
    	};
    }

    function create_fragment$n(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let table;
    	let thead;
    	let t3;
    	let tbody;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let t4;
    	let nav;
    	let a0;
    	let t6;
    	let a1;
    	let t8;
    	let ul;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*links*/ ctx[6].length && create_if_block_8$1(ctx);
    	let if_block1 = /*actions*/ ctx[5].length && create_if_block_7$1(ctx);
    	let if_block2 = /*showSearch*/ ctx[7] && create_if_block_6$1(ctx);
    	let each_value_3 = /*fields*/ ctx[4];
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_1[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_1 = /*items*/ ctx[1];
    	const get_key = ctx => /*item*/ ctx[19]._id;

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$2(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block_1$2(key, child_ctx));
    	}

    	let if_block3 = /*state*/ ctx[0].pagination && /*state*/ ctx[0].pagination.pages && /*state*/ ctx[0].pagination.pages.list && create_if_block$e(ctx);

    	return {
    		c() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			table = element("table");
    			thead = element("thead");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t3 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			nav = element("nav");
    			a0 = element("a");
    			a0.textContent = "Назад";
    			t6 = space();
    			a1 = element("a");
    			a1.textContent = "Вперед";
    			t8 = space();
    			ul = element("ul");
    			if (if_block3) if_block3.c();
    			attr(table, "class", "table");
    			attr(a0, "class", "pagination-previous");
    			attr(a1, "class", "pagination-next");
    			attr(ul, "class", "pagination-list");
    			attr(nav, "class", "pagination is-centered");
    			attr(nav, "role", "navigation");
    			attr(nav, "aria-label", "pagination");
    		},
    		m(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert(target, t2, anchor);
    			insert(target, table, anchor);
    			append(table, thead);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(thead, null);
    			}

    			append(table, t3);
    			append(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			insert(target, t4, anchor);
    			insert(target, nav, anchor);
    			append(nav, a0);
    			append(nav, t6);
    			append(nav, a1);
    			append(nav, t8);
    			append(nav, ul);
    			if (if_block3) if_block3.m(ul, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(a0, "click", /*goPrev*/ ctx[9]),
    					listen(a1, "click", /*goNext*/ ctx[10])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (/*links*/ ctx[6].length) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*links*/ 64) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_8$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*actions*/ ctx[5].length) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*actions*/ 32) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_7$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*showSearch*/ ctx[7]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_6$1(ctx);
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*fields*/ 16) {
    				each_value_3 = /*fields*/ ctx[4];
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_3(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(thead, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_3.length;
    			}

    			if (dirty & /*fields, notPath, items, helpers*/ 26) {
    				const each_value_1 = /*items*/ ctx[1];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each1_lookup, tbody, outro_and_destroy_block, create_each_block_1$2, null, get_each_context_1$2);
    				check_outros();
    			}

    			if (/*state*/ ctx[0].pagination && /*state*/ ctx[0].pagination.pages && /*state*/ ctx[0].pagination.pages.list) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block$e(ctx);
    					if_block3.c();
    					if_block3.m(ul, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach(t2);
    			if (detaching) detach(table);
    			destroy_each(each_blocks_1, detaching);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching) detach(t4);
    			if (detaching) detach(nav);
    			if (if_block3) if_block3.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let dispatch = createEventDispatcher();
    	let { id } = $$props;
    	let { helpers = {} } = $$props;
    	let { state = {} } = $$props;
    	let { fields = [] } = $$props;
    	let { items = [] } = $$props;
    	let { actions = [] } = $$props;
    	let { links = [] } = $$props;
    	let { search = "" } = $$props;
    	let { showSearch = true } = $$props;

    	onMount(() => {
    		get(id).refined.subscribe(value => {
    			$$invalidate(1, items = value);
    		});

    		get(id).state.subscribe(value => {
    			$$invalidate(0, state = value);
    		});
    	});

    	function onSearchInput(ev) {
    		try {
    			let data = ev.currentTarget.value.trim();
    			dispatch("searchChange", data);
    		} catch(e) {
    			return;
    		}
    	}

    	function goPrev() {
    		dispatch("goToPrevPage");
    	}

    	function goNext() {
    		dispatch("goToNextPage");
    	}

    	function goTo(e) {
    		e.preventDefault();
    		let el = e.target;
    		dispatch("goToPage", parseInt(el.dataset.page));
    		return false;
    	}

    	function input_input_handler() {
    		search = this.value;
    		$$invalidate(2, search);
    	}

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(12, id = $$props.id);
    		if ("helpers" in $$props) $$invalidate(3, helpers = $$props.helpers);
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
    		if ("fields" in $$props) $$invalidate(4, fields = $$props.fields);
    		if ("items" in $$props) $$invalidate(1, items = $$props.items);
    		if ("actions" in $$props) $$invalidate(5, actions = $$props.actions);
    		if ("links" in $$props) $$invalidate(6, links = $$props.links);
    		if ("search" in $$props) $$invalidate(2, search = $$props.search);
    		if ("showSearch" in $$props) $$invalidate(7, showSearch = $$props.showSearch);
    	};

    	return [
    		state,
    		items,
    		search,
    		helpers,
    		fields,
    		actions,
    		links,
    		showSearch,
    		onSearchInput,
    		goPrev,
    		goNext,
    		goTo,
    		id,
    		input_input_handler
    	];
    }

    class NotTable extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {
    			id: 12,
    			helpers: 3,
    			state: 0,
    			fields: 4,
    			items: 1,
    			actions: 5,
    			links: 6,
    			search: 2,
    			showSearch: 7
    		});
    	}
    }

    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return possibleConstructorReturn(this, result); }; }

    function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
    var OPT_DEFAULT_PAGE_SIZE = 20,
        OPT_DEFAULT_PAGE_NUMBER = 0,
        OPT_DEFAULT_PAGE_RANGE = 6,
        OPT_DEFAULT_SORT_DIRECTION = 1,
        OPT_DEFAULT_SEARCH = '',
        OPT_DEFAULT_RETURN = {},
        OPT_DEFAULT_COMBINED = false,
        OPT_DEFAULT_COMBINED_ACTION = 'listAndCount',
        OPT_DEFAULT_COUNT_ACTION = 'count',
        OPT_DEFAULT_LIST_ACTION = 'list',
        OPT_DEFAULT_SORT_FIELD = '_id',
        OPT_FIELD_NAME_PRE_PROC = 'preprocessor';
    var DEFAULT_OPTIONS = {
      links: [],
      actions: [],
      endless: false
    };

    var notTable = /*#__PURE__*/function (_EventEmitter) {
      inherits(notTable, _EventEmitter);

      var _super = _createSuper(notTable);

      function notTable() {
        var _this;

        var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        classCallCheck(this, notTable);

        _this = _super.call(this);
        _this.id = 'table-' + Math.random();
        _this.options = Object.assign(DEFAULT_OPTIONS, input.options ? input.options : {});
        _this.ui = {};
        _this.data = {
          raw: [],
          filtered: [],
          refined: []
        };
        _this.state = {
          pagination: {
            items: {
              count: 0,
              from: 0,
              to: 0
            },
            pages: {
              count: 0,
              from: 0,
              to: 0,
              current: 0,
              list: []
            }
          }
        };
        _this.working = {};
        _this.stores = create(_this.id, {
          'raw': [],
          'filtered': [],
          'refined': [],
          'state': _this.state,
          'working': _this.working
        });

        _this.stores.working.subscribe(_this.onWorkingUpdate.bind(assertThisInitialized(_this))); //полученные из сети


        _this.stores.raw.subscribe(_this.onRawUpdate.bind(assertThisInitialized(_this))); //применены фильтры, сортировки и т.д.


        _this.stores.filtered.subscribe(_this.onFilteredUpdate.bind(assertThisInitialized(_this))); //урезаны до минимального набора, точно соотвествующего табличному формату


        _this.stores.refined.subscribe(_this.onRefinedUpdate.bind(assertThisInitialized(_this))); //pagination, items information


        _this.stores.state.subscribe(_this.onStateUpdate.bind(assertThisInitialized(_this)));

        if (Object.prototype.hasOwnProperty.call(input, 'data') && Array.isArray(input.data)) {
          _this.stores.raw.update(function (val) {
            val = input.data;
            return val;
          });
        }

        if (Object.prototype.hasOwnProperty.call(_this.options, 'filter')) {
          _this.setFilter(_this.options.filter);
        } else {
          _this.resetFilter();
        }

        if (Object.prototype.hasOwnProperty.call(_this.options, 'pager')) {
          _this.setPager(_this.options.pager);
        } else {
          _this.resetPager();
        }

        if (Object.prototype.hasOwnProperty.call(_this.options, 'sorter')) {
          _this.setSorter(_this.options.sorter);
        } else {
          _this.resetSorter();
        }

        if (Object.prototype.hasOwnProperty.call(_this.options, 'return')) {
          _this.setReturn(_this.options.return);
        } else {
          _this.setReturn();
        }

        if (Object.prototype.hasOwnProperty.call(_this.options, 'search')) {
          _this.setSearch(_this.options.search);
        } else {
          _this.setSearch();
        }

        _this.render();

        _this.updateData();

        return possibleConstructorReturn(_this, assertThisInitialized(_this));
      }

      createClass(notTable, [{
        key: "onWorkingUpdate",
        value: function onWorkingUpdate(val) {
          this.working = val;
          return val;
        }
      }, {
        key: "onRawUpdate",
        value: function onRawUpdate(val) {
          this.data.raw = val;
          return val;
        }
      }, {
        key: "onFilteredUpdate",
        value: function onFilteredUpdate(val) {
          this.data.filtered = val;
          this.refineFiltered();
          return val;
        }
      }, {
        key: "onRefinedUpdate",
        value: function onRefinedUpdate(val) {
          this.data.refined = val;
          return val;
        }
      }, {
        key: "onStateUpdate",
        value: function onStateUpdate(val) {
          this.state = val;
          return val;
        }
      }, {
        key: "onSearchChange",
        value: function onSearchChange(line) {
          if (line.length > 3) {
            this.setSearch(line);
          } else {
            this.setSearch();
          }
        }
      }, {
        key: "render",
        value: function render() {
          var _this2 = this;

          if (!this.ui.table) {
            this.ui.table = new NotTable({
              target: this.options.targetEl,
              props: {
                id: this.id,
                helpers: Object.assign({}, this.getHelpers()),
                fields: this.getOptions('fields'),
                actions: this.getActions(),
                links: this.getLinks(),
                search: ''
              }
            });
          }

          this.ui.table.$on('searchChange', function (e) {
            return _this2.onSearchChange(e.detail);
          });
          this.ui.table.$on('goToPage', function (e) {
            return _this2.goToPage(e.detail);
          });
          this.ui.table.$on('goToNextPage', function (e) {
            return _this2.goToNext();
          });
          this.ui.table.$on('goToPrevPage', function (e) {
            return _this2.goToPrev();
          });
        }
      }, {
        key: "getActions",
        value: function getActions() {
          return this.getOptions('actions', []);
        }
      }, {
        key: "getLinks",
        value: function getLinks() {
          return this.getOptions('links', []);
        }
      }, {
        key: "getHelpers",
        value: function getHelpers() {
          return this.options.helpers || {};
        }
      }, {
        key: "setWorking",
        value: function setWorking(key, value) {
          var _this3 = this;

          this.stores.working.update(function (val) {
            notPath$1.set(':' + key, val, _this3.getHelpers(), value);
            return val;
          });
          return this;
        }
      }, {
        key: "getWorking",
        value: function getWorking(key, def) {
          var res = notPath$1.get(':' + key, this.working, this.getHelpers());

          if (res === undefined) {
            return def;
          } else {
            return res;
          }
        }
      }, {
        key: "setState",
        value: function setState(key, value) {
          var _this4 = this;

          this.stores.state.update(function (val) {
            notPath$1.set(':' + key, val, _this4.getHelpers(), value);
            return val;
          });
          return this;
        }
      }, {
        key: "getState",
        value: function getState(key, def) {
          var res = notPath$1.get(':' + key, this.state, this.getHelpers());

          if (res === undefined) {
            return def;
          } else {
            return res;
          }
        }
      }, {
        key: "setOptions",
        value: function setOptions(key, value) {
          notPath$1.set(':' + key, this.options, this.getHelpers(), value);
          return this;
        }
      }, {
        key: "getOptions",
        value: function getOptions(key, def) {
          var res = notPath$1.get(':' + key, this.options, this.getHelpers());

          if (res === undefined) {
            return def;
          } else {
            return res;
          }
        }
      }, {
        key: "setFilter",
        value: function setFilter(hash) {
          this.setState('filter', hash);
          this.invalidateData();
          this.updateData();
        }
      }, {
        key: "resetFilter",
        value: function resetFilter() {
          this.setState({});
        }
      }, {
        key: "getFilter",
        value: function getFilter() {
          return this.getState('filter');
        }
      }, {
        key: "setPager",
        value: function setPager(hash) {
          this.setState('pager', hash);
          this.updateData();
        }
      }, {
        key: "getDefaultPageNumber",
        value: function getDefaultPageNumber() {
          return isNaN(this.getOptions('pager.page')) ? OPT_DEFAULT_PAGE_NUMBER : this.getOptions('pager.page');
        }
      }, {
        key: "getDefaultPageSize",
        value: function getDefaultPageSize() {
          return isNaN(this.getOptions('pager.size')) ? OPT_DEFAULT_PAGE_SIZE : this.getOptions('pager.size');
        }
      }, {
        key: "resetPager",
        value: function resetPager() {
          this.setState('pager', {
            size: this.getDefaultPageSize(),
            page: this.getDefaultPageNumber()
          });
        }
      }, {
        key: "getPager",
        value: function getPager() {
          return this.getState('pager');
        }
      }, {
        key: "setSorter",
        value: function setSorter(hash) {
          this.setWorking('sorter', hash);
          this.invalidateData();
          this.updateData();
        }
      }, {
        key: "resetSorter",
        value: function resetSorter() {
          var t = {};
          t[OPT_DEFAULT_SORT_FIELD] = OPT_DEFAULT_SORT_DIRECTION;
          this.setSorter(t);
        }
      }, {
        key: "getSorter",
        value: function getSorter() {
          return this.getWorking('sorter');
        }
      }, {
        key: "getSorterDirection",
        value: function getSorterDirection() {
          try {
            var names = Object.keys(this.getSorter());
            return this.getSorter()[names[0]];
          } catch (e) {
            return OPT_DEFAULT_SORT_DIRECTION;
          }
        }
      }, {
        key: "getSearch",
        value: function getSearch() {
          var search = typeof this.getWorking('search') !== 'undefined' && this.getWorking('search') !== null;
          return search ? this.getWorking('search') : '';
        }
      }, {
        key: "setSearch",
        value: function setSearch() {
          var line = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : OPT_DEFAULT_SEARCH;
          this.setWorking('search', line);
          this.invalidateData();
          this.updateData();
          return this;
        }
      }, {
        key: "getReturn",
        value: function getReturn() {
          return this.getWorking('return');
        }
      }, {
        key: "setReturn",
        value: function setReturn() {
          var ret = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : OPT_DEFAULT_RETURN;
          this.setWorking('return', ret);
          return this;
        }
      }, {
        key: "clearFilteredData",
        value: function clearFilteredData() {
          this.stores.filtered.update(function (val) {
            val.splice(0, val.length);
            return val;
          });
        }
      }, {
        key: "clearRawData",
        value: function clearRawData() {
          this.stores.raw.update(function (val) {
            val.splice(0, val.length);
            return val;
          });
        }
      }, {
        key: "clearRefinedData",
        value: function clearRefinedData() {
          this.stores.refined.update(function (val) {
            val.splice(0, val.length);
            return val;
          });
        }
      }, {
        key: "invalidateData",
        value: function invalidateData() {
          //clearing filtered and sorted
          this.clearFilteredData(); //in case live loading from server

          if (this.isLive()) {
            //clearing loaded data
            this.clearRawData();
          } //resset pager anyway


          this.resetPager();
        }
      }, {
        key: "isLive",
        value: function isLive() {
          return this.getOptions('interface') && this.getOptions('interface.factory');
        }
      }, {
        key: "setUpdating",
        value: function setUpdating() {
          this.setState('updating', true);
        }
      }, {
        key: "setUpdated",
        value: function setUpdated() {
          this.setState('updating', false);
        }
      }, {
        key: "ifUpdating",
        value: function ifUpdating() {
          return this.getState('updating');
        }
      }, {
        key: "getDataInterface",
        value: function getDataInterface() {
          return this.getOptions('interface.factory')({});
        }
      }, {
        key: "getLoadDataActionName",
        value: function getLoadDataActionName() {
          return this.getOptions('interface.listAction') ? this.getOptions('interface.listAction') : OPT_DEFAULT_LIST_ACTION;
        }
      }, {
        key: "getCombinedActionName",
        value: function getCombinedActionName() {
          return this.getOptions('interface.combinedAction') ? this.getOptions('interface.combinedAction') : OPT_DEFAULT_COMBINED_ACTION;
        }
      }, {
        key: "getCountActionName",
        value: function getCountActionName() {
          return this.getOptions('interface.countAction') ? this.getOptions('interface.countAction') : OPT_DEFAULT_COUNT_ACTION;
        }
      }, {
        key: "loadData",
        value: function loadData() {
          //load from server
          var query = this.getDataInterface().setFilter(this.getFilter()).setSorter(this.getSorter()).setReturn(this.getReturn()).setSearch(this.getSearch()).setPager(this.getPager().size, this.getPager().page),
              actionName;

          if (this.getOptions('interface.combined', OPT_DEFAULT_COMBINED)) {
            actionName = this.getCombinedActionName();
          } else {
            actionName = this.getLoadDataActionName();
          }

          return query['$' + actionName]();
        }
      }, {
        key: "goToNext",
        value: function goToNext() {
          var next = isNaN(this.getState('pager.page')) ? this.getDefaultPageNumber() : this.getState('pager.page') + 1;
          this.setState('pager.page', Math.min(next, this.getState('pagination.pages.to')));
          this.updateData();
        }
      }, {
        key: "goToPrev",
        value: function goToPrev() {
          var prev = isNaN(this.getState('pager.page')) ? this.getDefaultPageNumber() : this.getState('pager.page') - 1;
          this.setState('pager.page', Math.max(prev, this.getState('pagination.pages.from')));
          this.updateData();
        }
      }, {
        key: "goToFirst",
        value: function goToFirst() {
          this.setState('pager.page', this.getState('pagination.pages.from'));
          this.updateData();
        }
      }, {
        key: "goToLast",
        value: function goToLast() {
          this.setState('pager.page', this.getState('pagination.pages.to'));
          this.updateData();
        }
      }, {
        key: "goToPage",
        value: function goToPage(pageNumber) {
          this.setState('pager.page', pageNumber);
          this.updateData();
        }
      }, {
        key: "testDataItem",
        value: function testDataItem(item) {
          var strValue = this.getSearch().toLowerCase();

          for (var k in item) {
            var toComp = item[k].toString().toLowerCase();

            if (toComp.indexOf(strValue) > -1) {
              return true;
            }
          }

          return false;
        }
      }, {
        key: "getRowsCount",
        value: function getRowsCount() {
          var _this5 = this;

          var query = this.getDataInterface().setFilter(this.getFilter());
          return query['$' + this.getCountActionName()]().then(function (data) {
            _this5.updatePagination(data.count);
          }).catch(function (e) {
            _this5.error(e);
          });
        }
      }, {
        key: "updatePagination",
        value: function updatePagination(itemsCount) {
          var _this6 = this;

          this.log('update pagination', itemsCount);
          this.state.pagination.pages.list.splice(0, this.state.pagination.pages.list.length);
          var itemsFrom = (this.getPager().page - OPT_DEFAULT_PAGE_NUMBER) * this.getPager().size + 1,
              pagesCount = itemsCount % this.getPager().size ? Math.floor(itemsCount / this.getPager().size) + 1 : Math.round(itemsCount / this.getPager().size),
              pagesFrom = Math.max(OPT_DEFAULT_PAGE_NUMBER, this.getPager().page - OPT_DEFAULT_PAGE_RANGE),
              pagesTo = Math.min(pagesCount - (1 - OPT_DEFAULT_PAGE_NUMBER), this.getPager().page + OPT_DEFAULT_PAGE_RANGE),
              list = [],
              itemsTo = Math.min(itemsFrom + this.getPager().size - 1, itemsCount);

          for (var t = pagesFrom; t <= pagesTo; t++) {
            list.push({
              index: t,
              active: t === this.getPager().page
            });
          }

          this.stores.state.update(function (val) {
            var _val$pagination$pages;

            _this6.log('update pagination', val);

            val.pagination.items.count = itemsCount;
            val.pagination.items.from = itemsFrom;
            val.pagination.items.to = itemsTo;
            val.pagination.pages.count = pagesCount;
            val.pagination.pages.from = pagesFrom;
            val.pagination.pages.to = pagesTo;
            val.pagination.pages.current = _this6.getPager().page;

            (_val$pagination$pages = val.pagination.pages.list).splice.apply(_val$pagination$pages, [0, val.pagination.pages.list.length].concat(list));

            return val;
          });
        }
      }, {
        key: "updateData",
        value: function updateData() {
          var _this7 = this;

          if (this.isLive()) {
            if (this.ifUpdating()) {
              return;
            }

            if (!this.getOptions('endless', false)) {
              this.clearRawData();
            }

            this.setUpdating();

            if (this.getOptions('interface.combined', OPT_DEFAULT_COMBINED)) {
              this.loadData().then(function (data) {
                _this7.stores.filtered.update(function (val) {
                  if (!_this7.getOptions('endless', false)) {
                    _this7.clearFilteredData();
                  }

                  if (Object.prototype.hasOwnProperty.call(data, 'list') && Array.isArray(data.list)) {
                    val.push.apply(val, toConsumableArray(data.list));
                  } else if (Array.isArray(data)) {
                    val.push.apply(val, toConsumableArray(data));
                  }

                  return val;
                });

                _this7.setWorking('lastCount', data.count);
              }).then(function () {
                _this7.updatePagination(_this7.getWorking('lastCount'));
              }).catch(this.error.bind(this)).then(this.setUpdated.bind(this));
            } else {
              this.loadData().then(function (data) {
                _this7.stores.filtered.update(function (val) {
                  val.push.apply(val, toConsumableArray(data));
                  return val;
                });
              }).then(this.getRowsCount.bind(this)).catch(this.error.bind(this)).then(this.setUpdated.bind(this));
            }
          } else {
            //local magic
            this.setUpdating();
            this.processData();
            this.setUpdated();
          }
        }
      }, {
        key: "getData",
        value: function getData() {
          return this.data;
        }
      }, {
        key: "processData",
        value: function processData() {
          var _this8 = this;

          var thatFilter = this.getFilter(); //this.getData('rows').__setPassive;

          this.log(this.getData());

          if (typeof thatFilter !== 'undefined' && thatFilter !== null && typeof thatFilter.filterSearch !== 'undefined' && thatFilter.filterSearch !== null && thatFilter.filterSearch.length > 0) {
            this.stores.filtered.update(function (val) {
              val.splice.apply(val, [0, val.length].concat(toConsumableArray(_this8.data.raw.filter(_this8.testDataItem.bind(_this8)))));
              return val;
            });
          } else {
            this.stores.filtered.update(function (val) {
              val.splice.apply(val, [0, val.length].concat(toConsumableArray(_this8.data.raw)));
              return val;
            });
          } ////sorter


          var thatSorter = this.getSorter();

          if (typeof thatSorter !== 'undefined' && thatSorter !== null) {
            this.stores.filtered.update(function (val) {
              val.sort(function (item1, item2) {
                var t1 = notPath$1.get(thatSorter.sortByField, item1, {}),
                    t2 = notPath$1.get(thatSorter.sortByField, item2, {});

                if (isNaN(t1)) {
                  if (typeof t1 !== 'undefined' && typeof t2 !== 'undefined' && t1.localeCompare) {
                    return t1.localeCompare() * -thatSorter.sortDirection;
                  } else {
                    return 0;
                  }
                } else {
                  return (t1 < t2 ? 1 : -1) * thatSorter.sortDirection;
                }
              });
              return val;
            });
          }
        }
      }, {
        key: "error",
        value: function error() {
          if (this.options.logger) {
            var _this$options$logger;

            (_this$options$logger = this.options.logger).error.apply(_this$options$logger, arguments);
          }
        }
      }, {
        key: "log",
        value: function log() {
          if (this.options.logger) {
            var _this$options$logger2;

            (_this$options$logger2 = this.options.logger).log.apply(_this$options$logger2, arguments);
          }
        }
      }, {
        key: "refineFiltered",
        value: function refineFiltered() {
          var _this9 = this;

          var result = [];
          this.data.filtered.forEach(function (item, index) {
            var refined = {};

            _this9.getOptions('fields').forEach(function (field) {
              var preprocessed = null,
                  val = notPath$1.get(field.path, item, _this9.getOptions('helpers'));

              if (Object.prototype.hasOwnProperty.call(field, OPT_FIELD_NAME_PRE_PROC)) {
                preprocessed = field[OPT_FIELD_NAME_PRE_PROC](val, item, index);
                notPath$1.set(field.path, refined, preprocessed);
              } else {
                notPath$1.set(field.path, refined, val);
              }
            });

            result.push(refined);
          });
          this.stores.refined.update(function (val) {
            val.splice.apply(val, [0, val.length].concat(result));
            return val;
          });
        }
      }, {
        key: "$destroy",
        value: function $destroy() {
          for (var name in this.ui) {
            this.ui[name].$destroy && this.ui[name].$destroy();
            delete this.ui[name];
          }
        }
      }]);

      return notTable;
    }(EventEmitter);

    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }

      return obj;
    }

    var defineProperty = _defineProperty;

    var Breadcrumbs = /*#__PURE__*/function () {
      function Breadcrumbs() {
        classCallCheck(this, Breadcrumbs);
      }

      createClass(Breadcrumbs, null, [{
        key: "render",
        value: function render(_ref) {
          var target = _ref.target,
              _ref$root = _ref.root,
              root = _ref$root === void 0 ? '' : _ref$root,
              navigate = _ref.navigate;
          this.remove();
          this.ui = new Ui_breadcrumbs({
            target: target,
            props: {
              items: this.getBreadcrumbs(),
              root: root,
              go: navigate
            }
          });
        }
      }, {
        key: "setHead",
        value: function setHead(head) {
          var _this$head;

          (_this$head = this.head).splice.apply(_this$head, [0, this.head.length].concat(toConsumableArray(head)));

          return this;
        }
      }, {
        key: "setTail",
        value: function setTail(tail) {
          var _this$tail;

          (_this$tail = this.tail).splice.apply(_this$tail, [0, this.tail.length].concat(toConsumableArray(tail)));

          return this;
        }
      }, {
        key: "getBreadcrumbs",
        value: function getBreadcrumbs() {
          var crumbs = [];
          crumbs.push.apply(crumbs, toConsumableArray(this.head));
          crumbs.push.apply(crumbs, toConsumableArray(this.tail));
          return crumbs;
        }
      }, {
        key: "update",
        value: function update() {
          if (this.ui) {
            this.ui.$set({
              items: this.getBreadcrumbs()
            });
          }
        }
      }, {
        key: "remove",
        value: function remove() {
          if (this.ui) {
            this.ui.$destroy();
            this.ui = null;
          }

          return this;
        }
      }]);

      return Breadcrumbs;
    }();

    defineProperty(Breadcrumbs, "ui", null);

    defineProperty(Breadcrumbs, "head", []);

    defineProperty(Breadcrumbs, "tail", []);

    var Menu = /*#__PURE__*/function () {
      function Menu() {
        classCallCheck(this, Menu);
      }

      createClass(Menu, null, [{
        key: "setApp",
        value: function setApp(app) {
          this.app = app;
          return this;
        }
      }, {
        key: "setOptions",
        value: function setOptions(options) {
          this.options = Object.assign(this.options, options);
          return this;
        }
      }, {
        key: "getOptionsPathTo",
        value: function getOptionsPathTo(what) {
          return "menu.".concat(this.options.type, ".").concat(what);
        }
      }, {
        key: "getOptions",
        value: function getOptions() {
          if (this.app) {
            var router = this.app.getWorking('router', false),
                someNavigate;

            if (router) {
              someNavigate = function someNavigate(urls) {
                router.navigate.call(router, urls.short);
              };
            } else {
              someNavigate = this.options.navigate.bind(this);
            }

            return {
              items: this.app.getOptions(this.getOptionsPathTo('items'), this.options.items),
              sections: this.app.getOptions(this.getOptionsPathTo('sections'), this.options.sections),
              targetSelector: this.app.getOptions(this.getOptionsPathTo('targetSelector'), this.options.targetSelector),
              root: this.app.getOptions('router.root', this.options.root),
              navigate: someNavigate
            };
          } else {
            return this.options;
          }
        }
      }, {
        key: "initField",
        value: function initField(list, field) {
          var _this = this;

          list.forEach(function (item) {
            if (!Object.prototype.hasOwnProperty.call(item, field)) {
              item[field] = _this.DEFAULT[field];
            }

            if (Object.prototype.hasOwnProperty.call(item, 'items')) {
              _this.initField(item.items, field);
            }
          });
        }
      }, {
        key: "sortList",
        value: function sortList(list) {
          var _this2 = this;

          list.sort(function (item1, item2) {
            if (Object.prototype.hasOwnProperty.call(item1, 'items')) {
              _this2.sortList(item1.items);
            }

            if (Object.prototype.hasOwnProperty.call(item2, 'items')) {
              _this2.sortList(item2.items);
            }

            if (item1.priority === item2.priority) {
              return item1.title > item2.title ? 1 : -1;
            } else {
              return item1.priority < item2.priority ? 1 : -1;
            }
          });
        }
      }, {
        key: "removeDublicates",
        value: function removeDublicates(sections) {
          var _loop = function _loop(i) {
            var priority = sections[i].priority;
            sections.filter(function (section) {
              return section.id === sections[i].id;
            }).forEach(function (item, indx) {
              if (indx === 0) {
                return;
              }

              if (item.priority < priority) {
                priority = item.priority;
              }

              sections.splice(sections.indexOf(item), 1);
            });
            sections[i].priority = priority;
          };

          for (var i = 0; i < sections.length; i++) {
            _loop(i);
          }

          return sections;
        }
      }, {
        key: "prepareData",
        value: function prepareData() {
          var items = [];
          items.push.apply(items, toConsumableArray(this.getOptions().items));
          var sections = [];
          sections.push.apply(sections, toConsumableArray(this.getOptions().sections));
          this.initField(sections, 'priority');
          this.removeDublicates(sections);
          this.initField(items, 'priority');
          this.initField(items, 'section');
          this.sortList(sections);
          sections.push({
            id: this.DEFAULT.section,
            title: this.DEFAULT.sectionTitle
          });
          this.sortList(items);
          this.sections = sections;
          this.items = items;
        }
      }, {
        key: "remove",
        value: function remove() {
          if (this.menu) {
            this.menu.$destroy();
            this.menu = null;
            clearInterval(this.interval);
          }
        }
      }]);

      return Menu;
    }();

    defineProperty(Menu, "DEFAULT", {
      section: 'any',
      sectionTitle: 'Меню',
      priority: 0
    });

    defineProperty(Menu, "app", false);

    defineProperty(Menu, "menu", void 0);

    defineProperty(Menu, "options", {
      navigate: function navigate(urls) {
        if (Menu.app) {
          var func = Menu.app.getWorking('router');

          if (func) {
            func.navigate(urls.short);
          }
        } else {
          document.location.assign(urls.full);
        }
      }
    });

    defineProperty(Menu, "items", []);

    defineProperty(Menu, "sections", []);

    defineProperty(Menu, "location", void 0);

    defineProperty(Menu, "interval", void 0);

    function _createSuper$1(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$1(); return function _createSuperInternal() { var Super = getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return possibleConstructorReturn(this, result); }; }

    function _isNativeReflectConstruct$1() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
    var TYPE = 'side';

    var SideMenu = /*#__PURE__*/function (_Menu) {
      inherits(SideMenu, _Menu);

      var _super = _createSuper$1(SideMenu);

      function SideMenu() {
        classCallCheck(this, SideMenu);

        return _super.apply(this, arguments);
      }

      createClass(SideMenu, null, [{
        key: "render",
        value: function render(app) {
          if (app) {
            this.setApp(app);
          }

          this.prepareData();

          if (!this.menu) {
            this.menu = new Ui_side_menu({
              target: document.querySelector(this.getOptions().targetSelector),
              props: {
                items: this.items,
                sections: this.sections,
                root: this.getOptions().root,
                navigate: this.getOptions().navigate
              }
            });
            this.interval = setInterval(this.updateMenuActiveItem.bind(this), 200);
          }
        }
      }, {
        key: "updateMenu",
        value: function updateMenu(url) {
          Array.from(document.querySelectorAll(this.getOptions().targetSelector + ' aside.menu a')).forEach(function (item) {
            if (item.href == url || url.href && url.href.indexOf(item.href) == 0) {
              item.classList.add('is-active');
            } else {
              item.classList.remove('is-active');
            }
          });
        }
      }, {
        key: "updateMenuActiveItem",
        value: function updateMenuActiveItem() {
          var url = window.location.toString(),
              lastLocation = this.location;

          if (lastLocation) {
            if (url !== lastLocation) {
              this.location = url;
              this.updateMenu(url);
            }
          } else {
            this.location = url;
            this.updateMenu(url);
          }
        }
      }]);

      return SideMenu;
    }(Menu);

    defineProperty(SideMenu, "DEFAULT", {
      section: 'any',
      sectionTitle: 'Меню',
      priority: 0
    });

    defineProperty(SideMenu, "options", {
      type: TYPE,
      items: [],
      sections: [],
      targetSelector: "#".concat(TYPE, "-menu"),
      root: '/',
      navigate: function navigate(urls) {
        if (SideMenu.app) {
          var func = SideMenu.app.getWorking('router');

          if (func) {
            func.navigate(urls.short);
          }
        } else {
          document.location.assign(urls.full);
        }
      }
    });

    /* src/ui.top.menu.svelte generated by Svelte v3.23.2 */

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    function get_each_context$a(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (22:2) {#if items.filter(t=>t.section===section.id).length }
    function create_if_block$f(ctx) {
    	let div1;
    	let a;
    	let t0_value = /*section*/ ctx[6].title + "";
    	let t0;
    	let t1;
    	let div0;
    	let t2;
    	let each_value_1 = /*items*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
    	}

    	return {
    		c() {
    			div1 = element("div");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			attr(a, "class", "navbar-link");
    			attr(div0, "class", "navbar-dropdown");
    			attr(div1, "class", "navbar-item has-dropdown is-hoverable is-pulled-right");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, a);
    			append(a, t0);
    			append(div1, t1);
    			append(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append(div1, t2);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*sections*/ 1 && t0_value !== (t0_value = /*section*/ ctx[6].title + "")) set_data(t0, t0_value);

    			if (dirty & /*root, items, onClick, sections*/ 15) {
    				each_value_1 = /*items*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (27:6) {#if section.id === item.section }
    function create_if_block_1$b(ctx) {
    	let t0;
    	let a;
    	let t1_value = /*item*/ ctx[9].title + "";
    	let t1;
    	let t2;
    	let t3;
    	let a_href_value;
    	let a_data_href_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*item*/ ctx[9].break && create_if_block_3$9();
    	let if_block1 = /*item*/ ctx[9].tag && create_if_block_2$a(ctx);

    	return {
    		c() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			a = element("a");
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			attr(a, "class", "navbar-item");
    			attr(a, "href", a_href_value = "" + (/*root*/ ctx[2] + /*item*/ ctx[9].url));
    			attr(a, "data-href", a_data_href_value = /*item*/ ctx[9].url);
    		},
    		m(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, a, anchor);
    			append(a, t1);
    			append(a, t2);
    			if (if_block1) if_block1.m(a, null);
    			append(a, t3);

    			if (!mounted) {
    				dispose = listen(a, "click", /*onClick*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (/*item*/ ctx[9].break) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_3$9();
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*items*/ 2 && t1_value !== (t1_value = /*item*/ ctx[9].title + "")) set_data(t1, t1_value);

    			if (/*item*/ ctx[9].tag) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2$a(ctx);
    					if_block1.c();
    					if_block1.m(a, t3);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*root, items*/ 6 && a_href_value !== (a_href_value = "" + (/*root*/ ctx[2] + /*item*/ ctx[9].url))) {
    				attr(a, "href", a_href_value);
    			}

    			if (dirty & /*items*/ 2 && a_data_href_value !== (a_data_href_value = /*item*/ ctx[9].url)) {
    				attr(a, "data-href", a_data_href_value);
    			}
    		},
    		d(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach(t0);
    			if (detaching) detach(a);
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (28:6) {#if item.break }
    function create_if_block_3$9(ctx) {
    	let hr;

    	return {
    		c() {
    			hr = element("hr");
    			attr(hr, "class", "navbar-divider");
    		},
    		m(target, anchor) {
    			insert(target, hr, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(hr);
    		}
    	};
    }

    // (32:8) {#if item.tag }
    function create_if_block_2$a(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[9].tag.label + "";
    	let t;
    	let span_class_value;

    	return {
    		c() {
    			span = element("span");
    			t = text(t_value);
    			attr(span, "class", span_class_value = "ml-3 tag is-" + /*item*/ ctx[9].tag.type + " is-pulled-right");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*items*/ 2 && t_value !== (t_value = /*item*/ ctx[9].tag.label + "")) set_data(t, t_value);

    			if (dirty & /*items*/ 2 && span_class_value !== (span_class_value = "ml-3 tag is-" + /*item*/ ctx[9].tag.type + " is-pulled-right")) {
    				attr(span, "class", span_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (26:6) {#each items as item}
    function create_each_block_1$3(ctx) {
    	let if_block_anchor;
    	let if_block = /*section*/ ctx[6].id === /*item*/ ctx[9].section && create_if_block_1$b(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (/*section*/ ctx[6].id === /*item*/ ctx[9].section) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$b(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (21:2) {#each sections as section }
    function create_each_block$a(ctx) {
    	let show_if = /*items*/ ctx[1].filter(func).length;
    	let if_block_anchor;

    	function func(...args) {
    		return /*func*/ ctx[5](/*section*/ ctx[6], ...args);
    	}

    	let if_block = show_if && create_if_block$f(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*items, sections*/ 3) show_if = /*items*/ ctx[1].filter(func).length;

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$f(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function create_fragment$o(ctx) {
    	let div;
    	let each_value = /*sections*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$a(get_each_context$a(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div, "class", "navbar-end mr-6");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*items, root, onClick, sections*/ 15) {
    				each_value = /*sections*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$a(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$a(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let { sections = [] } = $$props;
    	let { items = [] } = $$props;
    	let { root = "" } = $$props;
    	let { navigate = null } = $$props;

    	function onClick(ev) {
    		ev.preventDefault();

    		if (typeof navigate === "function") {
    			navigate({
    				full: ev.target.getAttribute("href"),
    				short: ev.target.dataset.href
    			});
    		}

    		return false;
    	}

    	const func = (section, t) => t.section === section.id;

    	$$self.$set = $$props => {
    		if ("sections" in $$props) $$invalidate(0, sections = $$props.sections);
    		if ("items" in $$props) $$invalidate(1, items = $$props.items);
    		if ("root" in $$props) $$invalidate(2, root = $$props.root);
    		if ("navigate" in $$props) $$invalidate(4, navigate = $$props.navigate);
    	};

    	return [sections, items, root, onClick, navigate, func];
    }

    class Ui_top_menu extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {
    			sections: 0,
    			items: 1,
    			root: 2,
    			navigate: 4
    		});
    	}
    }

    function _createSuper$2(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$2(); return function _createSuperInternal() { var Super = getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return possibleConstructorReturn(this, result); }; }

    function _isNativeReflectConstruct$2() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
    var TYPE$1 = 'top';

    var TopMenu = /*#__PURE__*/function (_Menu) {
      inherits(TopMenu, _Menu);

      var _super = _createSuper$2(TopMenu);

      function TopMenu() {
        classCallCheck(this, TopMenu);

        return _super.apply(this, arguments);
      }

      createClass(TopMenu, null, [{
        key: "render",
        value: function render(app) {
          if (app) {
            this.setApp(app);
          }

          this.prepareData();

          if (!this.menu) {
            this.menu = new Ui_top_menu({
              target: document.querySelector(this.getOptions().targetSelector),
              props: {
                items: this.items,
                sections: this.sections,
                root: this.getOptions().root,
                navigate: this.getOptions().navigate
              }
            });
            this.interval = setInterval(this.updateMenuActiveItem.bind(this), 200);
          }
        }
      }, {
        key: "updateMenu",
        value: function updateMenu(url) {
          Array.from(document.querySelectorAll(this.getOptions().targetSelector + ' aside.menu a')).forEach(function (item) {
            if (item.href == url || url.href && url.href.indexOf(item.href) == 0) {
              item.classList.add('is-active');
            } else {
              item.classList.remove('is-active');
            }
          });
        }
      }, {
        key: "updateMenuActiveItem",
        value: function updateMenuActiveItem() {
          var url = window.location.toString(),
              lastLocation = this.location;

          if (lastLocation) {
            if (url !== lastLocation) {
              this.location = url;
              this.updateMenu(url);
            }
          } else {
            this.location = url;
            this.updateMenu(url);
          }
        }
      }]);

      return TopMenu;
    }(Menu);

    defineProperty(TopMenu, "DEFAULT", {
      section: 'any',
      sectionTitle: 'Меню',
      priority: 0
    });

    defineProperty(TopMenu, "options", {
      type: TYPE$1,
      items: [],
      sections: [],
      targetSelector: "#".concat(TYPE$1, "-menu"),
      root: '/',
      navigate: function navigate(urls) {
        if (TopMenu.app) {
          var func = TopMenu.app.getWorking('router');

          if (func) {
            func.navigate(urls.short);
          }
        } else {
          document.location.assign(urls.full);
        }
      }
    });

    var assertString_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = assertString;

    function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

    function assertString(input) {
      var isString = typeof input === 'string' || input instanceof String;

      if (!isString) {
        var invalidType;

        if (input === null) {
          invalidType = 'null';
        } else {
          invalidType = _typeof(input);

          if (invalidType === 'object' && input.constructor && input.constructor.hasOwnProperty('name')) {
            invalidType = input.constructor.name;
          } else {
            invalidType = "a ".concat(invalidType);
          }
        }

        throw new TypeError("Expected string but received ".concat(invalidType, "."));
      }
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(assertString_1);

    var toDate_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = toDate;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function toDate(date) {
      (0, _assertString.default)(date);
      date = Date.parse(date);
      return !isNaN(date) ? new Date(date) : null;
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(toDate_1);

    var alpha_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.commaDecimal = exports.dotDecimal = exports.arabicLocales = exports.englishLocales = exports.decimal = exports.alphanumeric = exports.alpha = void 0;
    var alpha = {
      'en-US': /^[A-Z]+$/i,
      'bg-BG': /^[А-Я]+$/i,
      'cs-CZ': /^[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]+$/i,
      'da-DK': /^[A-ZÆØÅ]+$/i,
      'de-DE': /^[A-ZÄÖÜß]+$/i,
      'el-GR': /^[Α-ώ]+$/i,
      'es-ES': /^[A-ZÁÉÍÑÓÚÜ]+$/i,
      'fr-FR': /^[A-ZÀÂÆÇÉÈÊËÏÎÔŒÙÛÜŸ]+$/i,
      'it-IT': /^[A-ZÀÉÈÌÎÓÒÙ]+$/i,
      'nb-NO': /^[A-ZÆØÅ]+$/i,
      'nl-NL': /^[A-ZÁÉËÏÓÖÜÚ]+$/i,
      'nn-NO': /^[A-ZÆØÅ]+$/i,
      'hu-HU': /^[A-ZÁÉÍÓÖŐÚÜŰ]+$/i,
      'pl-PL': /^[A-ZĄĆĘŚŁŃÓŻŹ]+$/i,
      'pt-PT': /^[A-ZÃÁÀÂÄÇÉÊËÍÏÕÓÔÖÚÜ]+$/i,
      'ru-RU': /^[А-ЯЁ]+$/i,
      'sl-SI': /^[A-ZČĆĐŠŽ]+$/i,
      'sk-SK': /^[A-ZÁČĎÉÍŇÓŠŤÚÝŽĹŔĽÄÔ]+$/i,
      'sr-RS@latin': /^[A-ZČĆŽŠĐ]+$/i,
      'sr-RS': /^[А-ЯЂЈЉЊЋЏ]+$/i,
      'sv-SE': /^[A-ZÅÄÖ]+$/i,
      'tr-TR': /^[A-ZÇĞİıÖŞÜ]+$/i,
      'uk-UA': /^[А-ЩЬЮЯЄIЇҐі]+$/i,
      'ku-IQ': /^[ئابپتجچحخدرڕزژسشعغفڤقکگلڵمنوۆھەیێيطؤثآإأكضصةظذ]+$/i,
      ar: /^[ءآأؤإئابةتثجحخدذرزسشصضطظعغفقكلمنهوىيًٌٍَُِّْٰ]+$/,
      he: /^[א-ת]+$/,
      'fa-IR': /^['آابپتثجچهخدذرزژسشصضطظعغفقکگلمنوهی']+$/i
    };
    exports.alpha = alpha;
    var alphanumeric = {
      'en-US': /^[0-9A-Z]+$/i,
      'bg-BG': /^[0-9А-Я]+$/i,
      'cs-CZ': /^[0-9A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]+$/i,
      'da-DK': /^[0-9A-ZÆØÅ]+$/i,
      'de-DE': /^[0-9A-ZÄÖÜß]+$/i,
      'el-GR': /^[0-9Α-ω]+$/i,
      'es-ES': /^[0-9A-ZÁÉÍÑÓÚÜ]+$/i,
      'fr-FR': /^[0-9A-ZÀÂÆÇÉÈÊËÏÎÔŒÙÛÜŸ]+$/i,
      'it-IT': /^[0-9A-ZÀÉÈÌÎÓÒÙ]+$/i,
      'hu-HU': /^[0-9A-ZÁÉÍÓÖŐÚÜŰ]+$/i,
      'nb-NO': /^[0-9A-ZÆØÅ]+$/i,
      'nl-NL': /^[0-9A-ZÁÉËÏÓÖÜÚ]+$/i,
      'nn-NO': /^[0-9A-ZÆØÅ]+$/i,
      'pl-PL': /^[0-9A-ZĄĆĘŚŁŃÓŻŹ]+$/i,
      'pt-PT': /^[0-9A-ZÃÁÀÂÄÇÉÊËÍÏÕÓÔÖÚÜ]+$/i,
      'ru-RU': /^[0-9А-ЯЁ]+$/i,
      'sl-SI': /^[0-9A-ZČĆĐŠŽ]+$/i,
      'sk-SK': /^[0-9A-ZÁČĎÉÍŇÓŠŤÚÝŽĹŔĽÄÔ]+$/i,
      'sr-RS@latin': /^[0-9A-ZČĆŽŠĐ]+$/i,
      'sr-RS': /^[0-9А-ЯЂЈЉЊЋЏ]+$/i,
      'sv-SE': /^[0-9A-ZÅÄÖ]+$/i,
      'tr-TR': /^[0-9A-ZÇĞİıÖŞÜ]+$/i,
      'uk-UA': /^[0-9А-ЩЬЮЯЄIЇҐі]+$/i,
      'ku-IQ': /^[٠١٢٣٤٥٦٧٨٩0-9ئابپتجچحخدرڕزژسشعغفڤقکگلڵمنوۆھەیێيطؤثآإأكضصةظذ]+$/i,
      ar: /^[٠١٢٣٤٥٦٧٨٩0-9ءآأؤإئابةتثجحخدذرزسشصضطظعغفقكلمنهوىيًٌٍَُِّْٰ]+$/,
      he: /^[0-9א-ת]+$/,
      'fa-IR': /^['0-9آابپتثجچهخدذرزژسشصضطظعغفقکگلمنوهی۱۲۳۴۵۶۷۸۹۰']+$/i
    };
    exports.alphanumeric = alphanumeric;
    var decimal = {
      'en-US': '.',
      ar: '٫'
    };
    exports.decimal = decimal;
    var englishLocales = ['AU', 'GB', 'HK', 'IN', 'NZ', 'ZA', 'ZM'];
    exports.englishLocales = englishLocales;

    for (var locale, i = 0; i < englishLocales.length; i++) {
      locale = "en-".concat(englishLocales[i]);
      alpha[locale] = alpha['en-US'];
      alphanumeric[locale] = alphanumeric['en-US'];
      decimal[locale] = decimal['en-US'];
    } // Source: http://www.localeplanet.com/java/


    var arabicLocales = ['AE', 'BH', 'DZ', 'EG', 'IQ', 'JO', 'KW', 'LB', 'LY', 'MA', 'QM', 'QA', 'SA', 'SD', 'SY', 'TN', 'YE'];
    exports.arabicLocales = arabicLocales;

    for (var _locale, _i = 0; _i < arabicLocales.length; _i++) {
      _locale = "ar-".concat(arabicLocales[_i]);
      alpha[_locale] = alpha.ar;
      alphanumeric[_locale] = alphanumeric.ar;
      decimal[_locale] = decimal.ar;
    } // Source: https://en.wikipedia.org/wiki/Decimal_mark


    var dotDecimal = ['ar-EG', 'ar-LB', 'ar-LY'];
    exports.dotDecimal = dotDecimal;
    var commaDecimal = ['bg-BG', 'cs-CZ', 'da-DK', 'de-DE', 'el-GR', 'en-ZM', 'es-ES', 'fr-FR', 'it-IT', 'ku-IQ', 'hu-HU', 'nb-NO', 'nn-NO', 'nl-NL', 'pl-PL', 'pt-PT', 'ru-RU', 'sl-SI', 'sr-RS@latin', 'sr-RS', 'sv-SE', 'tr-TR', 'uk-UA'];
    exports.commaDecimal = commaDecimal;

    for (var _i2 = 0; _i2 < dotDecimal.length; _i2++) {
      decimal[dotDecimal[_i2]] = decimal['en-US'];
    }

    for (var _i3 = 0; _i3 < commaDecimal.length; _i3++) {
      decimal[commaDecimal[_i3]] = ',';
    }

    alpha['pt-BR'] = alpha['pt-PT'];
    alphanumeric['pt-BR'] = alphanumeric['pt-PT'];
    decimal['pt-BR'] = decimal['pt-PT']; // see #862

    alpha['pl-Pl'] = alpha['pl-PL'];
    alphanumeric['pl-Pl'] = alphanumeric['pl-PL'];
    decimal['pl-Pl'] = decimal['pl-PL'];
    });

    unwrapExports(alpha_1);
    var alpha_2 = alpha_1.commaDecimal;
    var alpha_3 = alpha_1.dotDecimal;
    var alpha_4 = alpha_1.arabicLocales;
    var alpha_5 = alpha_1.englishLocales;
    var alpha_6 = alpha_1.decimal;
    var alpha_7 = alpha_1.alphanumeric;
    var alpha_8 = alpha_1.alpha;

    var isFloat_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isFloat;
    exports.locales = void 0;

    var _assertString = _interopRequireDefault(assertString_1);



    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function isFloat(str, options) {
      (0, _assertString.default)(str);
      options = options || {};
      var float = new RegExp("^(?:[-+])?(?:[0-9]+)?(?:\\".concat(options.locale ? alpha_1.decimal[options.locale] : '.', "[0-9]*)?(?:[eE][\\+\\-]?(?:[0-9]+))?$"));

      if (str === '' || str === '.' || str === '-' || str === '+') {
        return false;
      }

      var value = parseFloat(str.replace(',', '.'));
      return float.test(str) && (!options.hasOwnProperty('min') || value >= options.min) && (!options.hasOwnProperty('max') || value <= options.max) && (!options.hasOwnProperty('lt') || value < options.lt) && (!options.hasOwnProperty('gt') || value > options.gt);
    }

    var locales = Object.keys(alpha_1.decimal);
    exports.locales = locales;
    });

    unwrapExports(isFloat_1);
    var isFloat_2 = isFloat_1.locales;

    var toFloat_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = toFloat;

    var _isFloat = _interopRequireDefault(isFloat_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function toFloat(str) {
      if (!(0, _isFloat.default)(str)) return NaN;
      return parseFloat(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(toFloat_1);

    var toInt_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = toInt;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function toInt(str, radix) {
      (0, _assertString.default)(str);
      return parseInt(str, radix || 10);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(toInt_1);

    var toBoolean_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = toBoolean;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function toBoolean(str, strict) {
      (0, _assertString.default)(str);

      if (strict) {
        return str === '1' || /^true$/i.test(str);
      }

      return str !== '0' && !/^false$/i.test(str) && str !== '';
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(toBoolean_1);

    var equals_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = equals;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function equals(str, comparison) {
      (0, _assertString.default)(str);
      return str === comparison;
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(equals_1);

    var toString_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = toString;

    function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

    function toString(input) {
      if (_typeof(input) === 'object' && input !== null) {
        if (typeof input.toString === 'function') {
          input = input.toString();
        } else {
          input = '[object Object]';
        }
      } else if (input === null || typeof input === 'undefined' || isNaN(input) && !input.length) {
        input = '';
      }

      return String(input);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(toString_1);

    var merge_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = merge;

    function merge() {
      var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var defaults = arguments.length > 1 ? arguments[1] : undefined;

      for (var key in defaults) {
        if (typeof obj[key] === 'undefined') {
          obj[key] = defaults[key];
        }
      }

      return obj;
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(merge_1);

    var contains_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = contains;

    var _assertString = _interopRequireDefault(assertString_1);

    var _toString = _interopRequireDefault(toString_1);

    var _merge = _interopRequireDefault(merge_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var defaulContainsOptions = {
      ignoreCase: false
    };

    function contains(str, elem, options) {
      (0, _assertString.default)(str);
      options = (0, _merge.default)(options, defaulContainsOptions);
      return options.ignoreCase ? str.toLowerCase().indexOf((0, _toString.default)(elem).toLowerCase()) >= 0 : str.indexOf((0, _toString.default)(elem)) >= 0;
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(contains_1);

    var matches_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = matches;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function matches(str, pattern, modifiers) {
      (0, _assertString.default)(str);

      if (Object.prototype.toString.call(pattern) !== '[object RegExp]') {
        pattern = new RegExp(pattern, modifiers);
      }

      return pattern.test(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(matches_1);

    var isByteLength_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isByteLength;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

    /* eslint-disable prefer-rest-params */
    function isByteLength(str, options) {
      (0, _assertString.default)(str);
      var min;
      var max;

      if (_typeof(options) === 'object') {
        min = options.min || 0;
        max = options.max;
      } else {
        // backwards compatibility: isByteLength(str, min [, max])
        min = arguments[1];
        max = arguments[2];
      }

      var len = encodeURI(str).split(/%..|./).length - 1;
      return len >= min && (typeof max === 'undefined' || len <= max);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isByteLength_1);

    var isFQDN_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isFQDN;

    var _assertString = _interopRequireDefault(assertString_1);

    var _merge = _interopRequireDefault(merge_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var default_fqdn_options = {
      require_tld: true,
      allow_underscores: false,
      allow_trailing_dot: false
    };

    function isFQDN(str, options) {
      (0, _assertString.default)(str);
      options = (0, _merge.default)(options, default_fqdn_options);
      /* Remove the optional trailing dot before checking validity */

      if (options.allow_trailing_dot && str[str.length - 1] === '.') {
        str = str.substring(0, str.length - 1);
      }

      var parts = str.split('.');

      for (var i = 0; i < parts.length; i++) {
        if (parts[i].length > 63) {
          return false;
        }
      }

      if (options.require_tld) {
        var tld = parts.pop();

        if (!parts.length || !/^([a-z\u00a1-\uffff]{2,}|xn[a-z0-9-]{2,})$/i.test(tld)) {
          return false;
        } // disallow spaces && special characers


        if (/[\s\u2002-\u200B\u202F\u205F\u3000\uFEFF\uDB40\uDC20\u00A9\uFFFD]/.test(tld)) {
          return false;
        }
      }

      for (var part, _i = 0; _i < parts.length; _i++) {
        part = parts[_i];

        if (options.allow_underscores) {
          part = part.replace(/_/g, '');
        }

        if (!/^[a-z\u00a1-\uffff0-9-]+$/i.test(part)) {
          return false;
        } // disallow full-width chars


        if (/[\uff01-\uff5e]/.test(part)) {
          return false;
        }

        if (part[0] === '-' || part[part.length - 1] === '-') {
          return false;
        }
      }

      return true;
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isFQDN_1);

    var isIP_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isIP;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    /**
    11.3.  Examples

       The following addresses

                 fe80::1234 (on the 1st link of the node)
                 ff02::5678 (on the 5th link of the node)
                 ff08::9abc (on the 10th organization of the node)

       would be represented as follows:

                 fe80::1234%1
                 ff02::5678%5
                 ff08::9abc%10

       (Here we assume a natural translation from a zone index to the
       <zone_id> part, where the Nth zone of any scope is translated into
       "N".)

       If we use interface names as <zone_id>, those addresses could also be
       represented as follows:

                fe80::1234%ne0
                ff02::5678%pvc1.3
                ff08::9abc%interface10

       where the interface "ne0" belongs to the 1st link, "pvc1.3" belongs
       to the 5th link, and "interface10" belongs to the 10th organization.
     * * */
    var ipv4Maybe = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
    var ipv6Block = /^[0-9A-F]{1,4}$/i;

    function isIP(str) {
      var version = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      (0, _assertString.default)(str);
      version = String(version);

      if (!version) {
        return isIP(str, 4) || isIP(str, 6);
      } else if (version === '4') {
        if (!ipv4Maybe.test(str)) {
          return false;
        }

        var parts = str.split('.').sort(function (a, b) {
          return a - b;
        });
        return parts[3] <= 255;
      } else if (version === '6') {
        var addressAndZone = [str]; // ipv6 addresses could have scoped architecture
        // according to https://tools.ietf.org/html/rfc4007#section-11

        if (str.includes('%')) {
          addressAndZone = str.split('%');

          if (addressAndZone.length !== 2) {
            // it must be just two parts
            return false;
          }

          if (!addressAndZone[0].includes(':')) {
            // the first part must be the address
            return false;
          }

          if (addressAndZone[1] === '') {
            // the second part must not be empty
            return false;
          }
        }

        var blocks = addressAndZone[0].split(':');
        var foundOmissionBlock = false; // marker to indicate ::
        // At least some OS accept the last 32 bits of an IPv6 address
        // (i.e. 2 of the blocks) in IPv4 notation, and RFC 3493 says
        // that '::ffff:a.b.c.d' is valid for IPv4-mapped IPv6 addresses,
        // and '::a.b.c.d' is deprecated, but also valid.

        var foundIPv4TransitionBlock = isIP(blocks[blocks.length - 1], 4);
        var expectedNumberOfBlocks = foundIPv4TransitionBlock ? 7 : 8;

        if (blocks.length > expectedNumberOfBlocks) {
          return false;
        } // initial or final ::


        if (str === '::') {
          return true;
        } else if (str.substr(0, 2) === '::') {
          blocks.shift();
          blocks.shift();
          foundOmissionBlock = true;
        } else if (str.substr(str.length - 2) === '::') {
          blocks.pop();
          blocks.pop();
          foundOmissionBlock = true;
        }

        for (var i = 0; i < blocks.length; ++i) {
          // test for a :: which can not be at the string start/end
          // since those cases have been handled above
          if (blocks[i] === '' && i > 0 && i < blocks.length - 1) {
            if (foundOmissionBlock) {
              return false; // multiple :: in address
            }

            foundOmissionBlock = true;
          } else if (foundIPv4TransitionBlock && i === blocks.length - 1) ; else if (!ipv6Block.test(blocks[i])) {
            return false;
          }
        }

        if (foundOmissionBlock) {
          return blocks.length >= 1;
        }

        return blocks.length === expectedNumberOfBlocks;
      }

      return false;
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isIP_1);

    var isEmail_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isEmail;

    var _assertString = _interopRequireDefault(assertString_1);

    var _merge = _interopRequireDefault(merge_1);

    var _isByteLength = _interopRequireDefault(isByteLength_1);

    var _isFQDN = _interopRequireDefault(isFQDN_1);

    var _isIP = _interopRequireDefault(isIP_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

    function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

    function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

    function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

    function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

    function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

    var default_email_options = {
      allow_display_name: false,
      require_display_name: false,
      allow_utf8_local_part: true,
      require_tld: true
    };
    /* eslint-disable max-len */

    /* eslint-disable no-control-regex */

    var splitNameAddress = /^([^\x00-\x1F\x7F-\x9F\cX]+)<(.+)>$/i;
    var emailUserPart = /^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~]+$/i;
    var gmailUserPart = /^[a-z\d]+$/;
    var quotedEmailUser = /^([\s\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e]|(\\[\x01-\x09\x0b\x0c\x0d-\x7f]))*$/i;
    var emailUserUtf8Part = /^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+$/i;
    var quotedEmailUserUtf8 = /^([\s\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|(\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*$/i;
    var defaultMaxEmailLength = 254;
    /* eslint-enable max-len */

    /* eslint-enable no-control-regex */

    /**
     * Validate display name according to the RFC2822: https://tools.ietf.org/html/rfc2822#appendix-A.1.2
     * @param {String} display_name
     */

    function validateDisplayName(display_name) {
      var trim_quotes = display_name.match(/^"(.+)"$/i);
      var display_name_without_quotes = trim_quotes ? trim_quotes[1] : display_name; // display name with only spaces is not valid

      if (!display_name_without_quotes.trim()) {
        return false;
      } // check whether display name contains illegal character


      var contains_illegal = /[\.";<>]/.test(display_name_without_quotes);

      if (contains_illegal) {
        // if contains illegal characters,
        // must to be enclosed in double-quotes, otherwise it's not a valid display name
        if (!trim_quotes) {
          return false;
        } // the quotes in display name must start with character symbol \


        var all_start_with_back_slash = display_name_without_quotes.split('"').length === display_name_without_quotes.split('\\"').length;

        if (!all_start_with_back_slash) {
          return false;
        }
      }

      return true;
    }

    function isEmail(str, options) {
      (0, _assertString.default)(str);
      options = (0, _merge.default)(options, default_email_options);

      if (options.require_display_name || options.allow_display_name) {
        var display_email = str.match(splitNameAddress);

        if (display_email) {
          var display_name;

          var _display_email = _slicedToArray(display_email, 3);

          display_name = _display_email[1];
          str = _display_email[2];

          // sometimes need to trim the last space to get the display name
          // because there may be a space between display name and email address
          // eg. myname <address@gmail.com>
          // the display name is `myname` instead of `myname `, so need to trim the last space
          if (display_name.endsWith(' ')) {
            display_name = display_name.substr(0, display_name.length - 1);
          }

          if (!validateDisplayName(display_name)) {
            return false;
          }
        } else if (options.require_display_name) {
          return false;
        }
      }

      if (!options.ignore_max_length && str.length > defaultMaxEmailLength) {
        return false;
      }

      var parts = str.split('@');
      var domain = parts.pop();
      var user = parts.join('@');
      var lower_domain = domain.toLowerCase();

      if (options.domain_specific_validation && (lower_domain === 'gmail.com' || lower_domain === 'googlemail.com')) {
        /*
          Previously we removed dots for gmail addresses before validating.
          This was removed because it allows `multiple..dots@gmail.com`
          to be reported as valid, but it is not.
          Gmail only normalizes single dots, removing them from here is pointless,
          should be done in normalizeEmail
        */
        user = user.toLowerCase(); // Removing sub-address from username before gmail validation

        var username = user.split('+')[0]; // Dots are not included in gmail length restriction

        if (!(0, _isByteLength.default)(username.replace('.', ''), {
          min: 6,
          max: 30
        })) {
          return false;
        }

        var _user_parts = username.split('.');

        for (var i = 0; i < _user_parts.length; i++) {
          if (!gmailUserPart.test(_user_parts[i])) {
            return false;
          }
        }
      }

      if (!(0, _isByteLength.default)(user, {
        max: 64
      }) || !(0, _isByteLength.default)(domain, {
        max: 254
      })) {
        return false;
      }

      if (!(0, _isFQDN.default)(domain, {
        require_tld: options.require_tld
      })) {
        if (!options.allow_ip_domain) {
          return false;
        }

        if (!(0, _isIP.default)(domain)) {
          if (!domain.startsWith('[') || !domain.endsWith(']')) {
            return false;
          }

          var noBracketdomain = domain.substr(1, domain.length - 2);

          if (noBracketdomain.length === 0 || !(0, _isIP.default)(noBracketdomain)) {
            return false;
          }
        }
      }

      if (user[0] === '"') {
        user = user.slice(1, user.length - 1);
        return options.allow_utf8_local_part ? quotedEmailUserUtf8.test(user) : quotedEmailUser.test(user);
      }

      var pattern = options.allow_utf8_local_part ? emailUserUtf8Part : emailUserPart;
      var user_parts = user.split('.');

      for (var _i2 = 0; _i2 < user_parts.length; _i2++) {
        if (!pattern.test(user_parts[_i2])) {
          return false;
        }
      }

      return true;
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isEmail_1);

    var isURL_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isURL;

    var _assertString = _interopRequireDefault(assertString_1);

    var _isFQDN = _interopRequireDefault(isFQDN_1);

    var _isIP = _interopRequireDefault(isIP_1);

    var _merge = _interopRequireDefault(merge_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    /*
    options for isURL method

    require_protocol - if set as true isURL will return false if protocol is not present in the URL
    require_valid_protocol - isURL will check if the URL's protocol is present in the protocols option
    protocols - valid protocols can be modified with this option
    require_host - if set as false isURL will not check if host is present in the URL
    allow_protocol_relative_urls - if set as true protocol relative URLs will be allowed

    */
    var default_url_options = {
      protocols: ['http', 'https', 'ftp'],
      require_tld: true,
      require_protocol: false,
      require_host: true,
      require_valid_protocol: true,
      allow_underscores: false,
      allow_trailing_dot: false,
      allow_protocol_relative_urls: false
    };
    var wrapped_ipv6 = /^\[([^\]]+)\](?::([0-9]+))?$/;

    function isRegExp(obj) {
      return Object.prototype.toString.call(obj) === '[object RegExp]';
    }

    function checkHost(host, matches) {
      for (var i = 0; i < matches.length; i++) {
        var match = matches[i];

        if (host === match || isRegExp(match) && match.test(host)) {
          return true;
        }
      }

      return false;
    }

    function isURL(url, options) {
      (0, _assertString.default)(url);

      if (!url || url.length >= 2083 || /[\s<>]/.test(url)) {
        return false;
      }

      if (url.indexOf('mailto:') === 0) {
        return false;
      }

      options = (0, _merge.default)(options, default_url_options);
      var protocol, auth, host, hostname, port, port_str, split, ipv6;
      split = url.split('#');
      url = split.shift();
      split = url.split('?');
      url = split.shift();
      split = url.split('://');

      if (split.length > 1) {
        protocol = split.shift().toLowerCase();

        if (options.require_valid_protocol && options.protocols.indexOf(protocol) === -1) {
          return false;
        }
      } else if (options.require_protocol) {
        return false;
      } else if (url.substr(0, 2) === '//') {
        if (!options.allow_protocol_relative_urls) {
          return false;
        }

        split[0] = url.substr(2);
      }

      url = split.join('://');

      if (url === '') {
        return false;
      }

      split = url.split('/');
      url = split.shift();

      if (url === '' && !options.require_host) {
        return true;
      }

      split = url.split('@');

      if (split.length > 1) {
        if (options.disallow_auth) {
          return false;
        }

        auth = split.shift();

        if (auth.indexOf(':') >= 0 && auth.split(':').length > 2) {
          return false;
        }
      }

      hostname = split.join('@');
      port_str = null;
      ipv6 = null;
      var ipv6_match = hostname.match(wrapped_ipv6);

      if (ipv6_match) {
        host = '';
        ipv6 = ipv6_match[1];
        port_str = ipv6_match[2] || null;
      } else {
        split = hostname.split(':');
        host = split.shift();

        if (split.length) {
          port_str = split.join(':');
        }
      }

      if (port_str !== null) {
        port = parseInt(port_str, 10);

        if (!/^[0-9]+$/.test(port_str) || port <= 0 || port > 65535) {
          return false;
        }
      }

      if (!(0, _isIP.default)(host) && !(0, _isFQDN.default)(host, options) && (!ipv6 || !(0, _isIP.default)(ipv6, 6))) {
        return false;
      }

      host = host || ipv6;

      if (options.host_whitelist && !checkHost(host, options.host_whitelist)) {
        return false;
      }

      if (options.host_blacklist && checkHost(host, options.host_blacklist)) {
        return false;
      }

      return true;
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isURL_1);

    var isMACAddress_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isMACAddress;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var macAddress = /^([0-9a-fA-F][0-9a-fA-F]:){5}([0-9a-fA-F][0-9a-fA-F])$/;
    var macAddressNoColons = /^([0-9a-fA-F]){12}$/;
    var macAddressWithHyphen = /^([0-9a-fA-F][0-9a-fA-F]-){5}([0-9a-fA-F][0-9a-fA-F])$/;
    var macAddressWithSpaces = /^([0-9a-fA-F][0-9a-fA-F]\s){5}([0-9a-fA-F][0-9a-fA-F])$/;
    var macAddressWithDots = /^([0-9a-fA-F]{4}).([0-9a-fA-F]{4}).([0-9a-fA-F]{4})$/;

    function isMACAddress(str, options) {
      (0, _assertString.default)(str);

      if (options && options.no_colons) {
        return macAddressNoColons.test(str);
      }

      return macAddress.test(str) || macAddressWithHyphen.test(str) || macAddressWithSpaces.test(str) || macAddressWithDots.test(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isMACAddress_1);

    var isIPRange_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isIPRange;

    var _assertString = _interopRequireDefault(assertString_1);

    var _isIP = _interopRequireDefault(isIP_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var subnetMaybe = /^\d{1,2}$/;

    function isIPRange(str) {
      (0, _assertString.default)(str);
      var parts = str.split('/'); // parts[0] -> ip, parts[1] -> subnet

      if (parts.length !== 2) {
        return false;
      }

      if (!subnetMaybe.test(parts[1])) {
        return false;
      } // Disallow preceding 0 i.e. 01, 02, ...


      if (parts[1].length > 1 && parts[1].startsWith('0')) {
        return false;
      }

      return (0, _isIP.default)(parts[0], 4) && parts[1] <= 32 && parts[1] >= 0;
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isIPRange_1);

    var isDate_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isDate;

    function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

    function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

    function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

    function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

    function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

    function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

    function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

    function isValidFormat(format) {
      return /(^(y{4}|y{2})[\/-](m{1,2})[\/-](d{1,2})$)|(^(m{1,2})[\/-](d{1,2})[\/-]((y{4}|y{2})$))|(^(d{1,2})[\/-](m{1,2})[\/-]((y{4}|y{2})$))/gi.test(format);
    }

    function zip(date, format) {
      var zippedArr = [],
          len = Math.min(date.length, format.length);

      for (var i = 0; i < len; i++) {
        zippedArr.push([date[i], format[i]]);
      }

      return zippedArr;
    }

    function isDate(input) {
      var format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'YYYY/MM/DD';

      if (typeof input === 'string' && isValidFormat(format)) {
        var splitter = /[-/]/,
            dateAndFormat = zip(input.split(splitter), format.toLowerCase().split(splitter)),
            dateObj = {};

        var _iterator = _createForOfIteratorHelper(dateAndFormat),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var _step$value = _slicedToArray(_step.value, 2),
                dateWord = _step$value[0],
                formatWord = _step$value[1];

            if (dateWord.length !== formatWord.length) {
              return false;
            }

            dateObj[formatWord.charAt(0)] = dateWord;
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        return new Date("".concat(dateObj.m, "/").concat(dateObj.d, "/").concat(dateObj.y)).getDate() === +dateObj.d;
      }

      return Object.prototype.toString.call(input) === '[object Date]' && isFinite(input);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isDate_1);

    var isBoolean_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isBoolean;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function isBoolean(str) {
      (0, _assertString.default)(str);
      return ['true', 'false', '1', '0'].indexOf(str) >= 0;
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isBoolean_1);

    var isLocale_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isLocale;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var localeReg = /^[A-z]{2,4}([_-]([A-z]{4}|[\d]{3}))?([_-]([A-z]{2}|[\d]{3}))?$/;

    function isLocale(str) {
      (0, _assertString.default)(str);

      if (str === 'en_US_POSIX' || str === 'ca_ES_VALENCIA') {
        return true;
      }

      return localeReg.test(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isLocale_1);

    var isAlpha_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isAlpha;
    exports.locales = void 0;

    var _assertString = _interopRequireDefault(assertString_1);



    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function isAlpha(str) {
      var locale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'en-US';
      (0, _assertString.default)(str);

      if (locale in alpha_1.alpha) {
        return alpha_1.alpha[locale].test(str);
      }

      throw new Error("Invalid locale '".concat(locale, "'"));
    }

    var locales = Object.keys(alpha_1.alpha);
    exports.locales = locales;
    });

    unwrapExports(isAlpha_1);
    var isAlpha_2 = isAlpha_1.locales;

    var isAlphanumeric_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isAlphanumeric;
    exports.locales = void 0;

    var _assertString = _interopRequireDefault(assertString_1);



    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function isAlphanumeric(str) {
      var locale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'en-US';
      (0, _assertString.default)(str);

      if (locale in alpha_1.alphanumeric) {
        return alpha_1.alphanumeric[locale].test(str);
      }

      throw new Error("Invalid locale '".concat(locale, "'"));
    }

    var locales = Object.keys(alpha_1.alphanumeric);
    exports.locales = locales;
    });

    unwrapExports(isAlphanumeric_1);
    var isAlphanumeric_2 = isAlphanumeric_1.locales;

    var isNumeric_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isNumeric;

    var _assertString = _interopRequireDefault(assertString_1);



    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var numericNoSymbols = /^[0-9]+$/;

    function isNumeric(str, options) {
      (0, _assertString.default)(str);

      if (options && options.no_symbols) {
        return numericNoSymbols.test(str);
      }

      return new RegExp("^[+-]?([0-9]*[".concat((options || {}).locale ? alpha_1.decimal[options.locale] : '.', "])?[0-9]+$")).test(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isNumeric_1);

    var isPassportNumber_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isPassportNumber;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    /**
     * Reference:
     * https://en.wikipedia.org/ -- Wikipedia
     * https://docs.microsoft.com/en-us/microsoft-365/compliance/eu-passport-number -- EU Passport Number
     * https://countrycode.org/ -- Country Codes
     */
    var passportRegexByCountryCode = {
      AM: /^[A-Z]{2}\d{7}$/,
      // ARMENIA
      AR: /^[A-Z]{3}\d{6}$/,
      // ARGENTINA
      AT: /^[A-Z]\d{7}$/,
      // AUSTRIA
      AU: /^[A-Z]\d{7}$/,
      // AUSTRALIA
      BE: /^[A-Z]{2}\d{6}$/,
      // BELGIUM
      BG: /^\d{9}$/,
      // BULGARIA
      CA: /^[A-Z]{2}\d{6}$/,
      // CANADA
      CH: /^[A-Z]\d{7}$/,
      // SWITZERLAND
      CN: /^[GE]\d{8}$/,
      // CHINA [G=Ordinary, E=Electronic] followed by 8-digits
      CY: /^[A-Z](\d{6}|\d{8})$/,
      // CYPRUS
      CZ: /^\d{8}$/,
      // CZECH REPUBLIC
      DE: /^[CFGHJKLMNPRTVWXYZ0-9]{9}$/,
      // GERMANY
      DK: /^\d{9}$/,
      // DENMARK
      DZ: /^\d{9}$/,
      // ALGERIA
      EE: /^([A-Z]\d{7}|[A-Z]{2}\d{7})$/,
      // ESTONIA (K followed by 7-digits), e-passports have 2 UPPERCASE followed by 7 digits
      ES: /^[A-Z0-9]{2}([A-Z0-9]?)\d{6}$/,
      // SPAIN
      FI: /^[A-Z]{2}\d{7}$/,
      // FINLAND
      FR: /^\d{2}[A-Z]{2}\d{5}$/,
      // FRANCE
      GB: /^\d{9}$/,
      // UNITED KINGDOM
      GR: /^[A-Z]{2}\d{7}$/,
      // GREECE
      HR: /^\d{9}$/,
      // CROATIA
      HU: /^[A-Z]{2}(\d{6}|\d{7})$/,
      // HUNGARY
      IE: /^[A-Z0-9]{2}\d{7}$/,
      // IRELAND
      IN: /^[A-Z]{1}-?\d{7}$/,
      // INDIA
      IS: /^(A)\d{7}$/,
      // ICELAND
      IT: /^[A-Z0-9]{2}\d{7}$/,
      // ITALY
      JP: /^[A-Z]{2}\d{7}$/,
      // JAPAN
      KR: /^[MS]\d{8}$/,
      // SOUTH KOREA, REPUBLIC OF KOREA, [S=PS Passports, M=PM Passports]
      LT: /^[A-Z0-9]{8}$/,
      // LITHUANIA
      LU: /^[A-Z0-9]{8}$/,
      // LUXEMBURG
      LV: /^[A-Z0-9]{2}\d{7}$/,
      // LATVIA
      MT: /^\d{7}$/,
      // MALTA
      NL: /^[A-Z]{2}[A-Z0-9]{6}\d$/,
      // NETHERLANDS
      PO: /^[A-Z]{2}\d{7}$/,
      // POLAND
      PT: /^[A-Z]\d{6}$/,
      // PORTUGAL
      RO: /^\d{8,9}$/,
      // ROMANIA
      SE: /^\d{8}$/,
      // SWEDEN
      SL: /^(P)[A-Z]\d{7}$/,
      // SLOVANIA
      SK: /^[0-9A-Z]\d{7}$/,
      // SLOVAKIA
      TR: /^[A-Z]\d{8}$/,
      // TURKEY
      UA: /^[A-Z]{2}\d{6}$/,
      // UKRAINE
      US: /^\d{9}$/ // UNITED STATES

    };
    /**
     * Check if str is a valid passport number
     * relative to provided ISO Country Code.
     *
     * @param {string} str
     * @param {string} countryCode
     * @return {boolean}
     */

    function isPassportNumber(str, countryCode) {
      (0, _assertString.default)(str);
      /** Remove All Whitespaces, Convert to UPPERCASE */

      var normalizedStr = str.replace(/\s/g, '').toUpperCase();
      return countryCode.toUpperCase() in passportRegexByCountryCode && passportRegexByCountryCode[countryCode].test(normalizedStr);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isPassportNumber_1);

    var isInt_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isInt;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var int = /^(?:[-+]?(?:0|[1-9][0-9]*))$/;
    var intLeadingZeroes = /^[-+]?[0-9]+$/;

    function isInt(str, options) {
      (0, _assertString.default)(str);
      options = options || {}; // Get the regex to use for testing, based on whether
      // leading zeroes are allowed or not.

      var regex = options.hasOwnProperty('allow_leading_zeroes') && !options.allow_leading_zeroes ? int : intLeadingZeroes; // Check min/max/lt/gt

      var minCheckPassed = !options.hasOwnProperty('min') || str >= options.min;
      var maxCheckPassed = !options.hasOwnProperty('max') || str <= options.max;
      var ltCheckPassed = !options.hasOwnProperty('lt') || str < options.lt;
      var gtCheckPassed = !options.hasOwnProperty('gt') || str > options.gt;
      return regex.test(str) && minCheckPassed && maxCheckPassed && ltCheckPassed && gtCheckPassed;
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isInt_1);

    var isPort_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isPort;

    var _isInt = _interopRequireDefault(isInt_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function isPort(str) {
      return (0, _isInt.default)(str, {
        min: 0,
        max: 65535
      });
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isPort_1);

    var isLowercase_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isLowercase;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function isLowercase(str) {
      (0, _assertString.default)(str);
      return str === str.toLowerCase();
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isLowercase_1);

    var isUppercase_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isUppercase;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function isUppercase(str) {
      (0, _assertString.default)(str);
      return str === str.toUpperCase();
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isUppercase_1);

    var isIMEI_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isIMEI;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var imeiRegexWithoutHypens = /^[0-9]{15}$/;
    var imeiRegexWithHypens = /^\d{2}-\d{6}-\d{6}-\d{1}$/;

    function isIMEI(str, options) {
      (0, _assertString.default)(str);
      options = options || {}; // default regex for checking imei is the one without hyphens

      var imeiRegex = imeiRegexWithoutHypens;

      if (options.allow_hyphens) {
        imeiRegex = imeiRegexWithHypens;
      }

      if (!imeiRegex.test(str)) {
        return false;
      }

      str = str.replace(/-/g, '');
      var sum = 0,
          mul = 2,
          l = 14;

      for (var i = 0; i < l; i++) {
        var digit = str.substring(l - i - 1, l - i);
        var tp = parseInt(digit, 10) * mul;

        if (tp >= 10) {
          sum += tp % 10 + 1;
        } else {
          sum += tp;
        }

        if (mul === 1) {
          mul += 1;
        } else {
          mul -= 1;
        }
      }

      var chk = (10 - sum % 10) % 10;

      if (chk !== parseInt(str.substring(14, 15), 10)) {
        return false;
      }

      return true;
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isIMEI_1);

    var isAscii_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isAscii;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    /* eslint-disable no-control-regex */
    var ascii = /^[\x00-\x7F]+$/;
    /* eslint-enable no-control-regex */

    function isAscii(str) {
      (0, _assertString.default)(str);
      return ascii.test(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isAscii_1);

    var isFullWidth_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isFullWidth;
    exports.fullWidth = void 0;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var fullWidth = /[^\u0020-\u007E\uFF61-\uFF9F\uFFA0-\uFFDC\uFFE8-\uFFEE0-9a-zA-Z]/;
    exports.fullWidth = fullWidth;

    function isFullWidth(str) {
      (0, _assertString.default)(str);
      return fullWidth.test(str);
    }
    });

    unwrapExports(isFullWidth_1);
    var isFullWidth_2 = isFullWidth_1.fullWidth;

    var isHalfWidth_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isHalfWidth;
    exports.halfWidth = void 0;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var halfWidth = /[\u0020-\u007E\uFF61-\uFF9F\uFFA0-\uFFDC\uFFE8-\uFFEE0-9a-zA-Z]/;
    exports.halfWidth = halfWidth;

    function isHalfWidth(str) {
      (0, _assertString.default)(str);
      return halfWidth.test(str);
    }
    });

    unwrapExports(isHalfWidth_1);
    var isHalfWidth_2 = isHalfWidth_1.halfWidth;

    var isVariableWidth_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isVariableWidth;

    var _assertString = _interopRequireDefault(assertString_1);





    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function isVariableWidth(str) {
      (0, _assertString.default)(str);
      return isFullWidth_1.fullWidth.test(str) && isHalfWidth_1.halfWidth.test(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isVariableWidth_1);

    var isMultibyte_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isMultibyte;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    /* eslint-disable no-control-regex */
    var multibyte = /[^\x00-\x7F]/;
    /* eslint-enable no-control-regex */

    function isMultibyte(str) {
      (0, _assertString.default)(str);
      return multibyte.test(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isMultibyte_1);

    var multilineRegex = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = multilineRegexp;

    /**
     * Build RegExp object from an array
     * of multiple/multi-line regexp parts
     *
     * @param {string[]} parts
     * @param {string} flags
     * @return {object} - RegExp object
     */
    function multilineRegexp(parts) {
      var flags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var regexpAsStringLiteral = parts.join('');
      return new RegExp(regexpAsStringLiteral, flags);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(multilineRegex);

    var isSemVer_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isSemVer;

    var _assertString = _interopRequireDefault(assertString_1);

    var _multilineRegex = _interopRequireDefault(multilineRegex);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    /**
     * Regular Expression to match
     * semantic versioning (SemVer)
     * built from multi-line, multi-parts regexp
     * Reference: https://semver.org/
     */
    var semanticVersioningRegex = (0, _multilineRegex.default)(['^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)', '(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))', '?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$']);

    function isSemVer(str) {
      (0, _assertString.default)(str);
      return semanticVersioningRegex.test(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isSemVer_1);

    var isSurrogatePair_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isSurrogatePair;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var surrogatePair = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;

    function isSurrogatePair(str) {
      (0, _assertString.default)(str);
      return surrogatePair.test(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isSurrogatePair_1);

    var includes_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;

    var includes = function includes(arr, val) {
      return arr.some(function (arrVal) {
        return val === arrVal;
      });
    };

    var _default = includes;
    exports.default = _default;
    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(includes_1);

    var isDecimal_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isDecimal;

    var _merge = _interopRequireDefault(merge_1);

    var _assertString = _interopRequireDefault(assertString_1);

    var _includes = _interopRequireDefault(includes_1);



    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function decimalRegExp(options) {
      var regExp = new RegExp("^[-+]?([0-9]+)?(\\".concat(alpha_1.decimal[options.locale], "[0-9]{").concat(options.decimal_digits, "})").concat(options.force_decimal ? '' : '?', "$"));
      return regExp;
    }

    var default_decimal_options = {
      force_decimal: false,
      decimal_digits: '1,',
      locale: 'en-US'
    };
    var blacklist = ['', '-', '+'];

    function isDecimal(str, options) {
      (0, _assertString.default)(str);
      options = (0, _merge.default)(options, default_decimal_options);

      if (options.locale in alpha_1.decimal) {
        return !(0, _includes.default)(blacklist, str.replace(/ /g, '')) && decimalRegExp(options).test(str);
      }

      throw new Error("Invalid locale '".concat(options.locale, "'"));
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isDecimal_1);

    var isHexadecimal_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isHexadecimal;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var hexadecimal = /^(0x|0h)?[0-9A-F]+$/i;

    function isHexadecimal(str) {
      (0, _assertString.default)(str);
      return hexadecimal.test(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isHexadecimal_1);

    var isOctal_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isOctal;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var octal = /^(0o)?[0-7]+$/i;

    function isOctal(str) {
      (0, _assertString.default)(str);
      return octal.test(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isOctal_1);

    var isDivisibleBy_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isDivisibleBy;

    var _assertString = _interopRequireDefault(assertString_1);

    var _toFloat = _interopRequireDefault(toFloat_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function isDivisibleBy(str, num) {
      (0, _assertString.default)(str);
      return (0, _toFloat.default)(str) % parseInt(num, 10) === 0;
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isDivisibleBy_1);

    var isHexColor_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isHexColor;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var hexcolor = /^#?([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i;

    function isHexColor(str) {
      (0, _assertString.default)(str);
      return hexcolor.test(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isHexColor_1);

    var isRgbColor_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isRgbColor;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var rgbColor = /^rgb\((([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]),){2}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\)$/;
    var rgbaColor = /^rgba\((([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]),){3}(0?\.\d|1(\.0)?|0(\.0)?)\)$/;
    var rgbColorPercent = /^rgb\((([0-9]%|[1-9][0-9]%|100%),){2}([0-9]%|[1-9][0-9]%|100%)\)/;
    var rgbaColorPercent = /^rgba\((([0-9]%|[1-9][0-9]%|100%),){3}(0?\.\d|1(\.0)?|0(\.0)?)\)/;

    function isRgbColor(str) {
      var includePercentValues = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      (0, _assertString.default)(str);

      if (!includePercentValues) {
        return rgbColor.test(str) || rgbaColor.test(str);
      }

      return rgbColor.test(str) || rgbaColor.test(str) || rgbColorPercent.test(str) || rgbaColorPercent.test(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isRgbColor_1);

    var isHSL_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isHSL;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var hslcomma = /^(hsl)a?\(\s*((\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?))(deg|grad|rad|turn|\s*)(\s*,\s*(\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?)%){2}\s*(,\s*((\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?)%?)\s*)?\)$/i;
    var hslspace = /^(hsl)a?\(\s*((\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?))(deg|grad|rad|turn|\s)(\s*(\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?)%){2}\s*(\/\s*((\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?)%?)\s*)?\)$/i;

    function isHSL(str) {
      (0, _assertString.default)(str);
      return hslcomma.test(str) || hslspace.test(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isHSL_1);

    var isISRC_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isISRC;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    // see http://isrc.ifpi.org/en/isrc-standard/code-syntax
    var isrc = /^[A-Z]{2}[0-9A-Z]{3}\d{2}\d{5}$/;

    function isISRC(str) {
      (0, _assertString.default)(str);
      return isrc.test(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isISRC_1);

    var isIBAN_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isIBAN;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    /**
     * List of country codes with
     * corresponding IBAN regular expression
     * Reference: https://en.wikipedia.org/wiki/International_Bank_Account_Number
     */
    var ibanRegexThroughCountryCode = {
      AD: /^(AD[0-9]{2})\d{8}[A-Z0-9]{12}$/,
      AE: /^(AE[0-9]{2})\d{3}\d{16}$/,
      AL: /^(AL[0-9]{2})\d{8}[A-Z0-9]{16}$/,
      AT: /^(AT[0-9]{2})\d{16}$/,
      AZ: /^(AZ[0-9]{2})[A-Z0-9]{4}\d{20}$/,
      BA: /^(BA[0-9]{2})\d{16}$/,
      BE: /^(BE[0-9]{2})\d{12}$/,
      BG: /^(BG[0-9]{2})[A-Z]{4}\d{6}[A-Z0-9]{8}$/,
      BH: /^(BH[0-9]{2})[A-Z]{4}[A-Z0-9]{14}$/,
      BR: /^(BR[0-9]{2})\d{23}[A-Z]{1}[A-Z0-9]{1}$/,
      BY: /^(BY[0-9]{2})[A-Z0-9]{4}\d{20}$/,
      CH: /^(CH[0-9]{2})\d{5}[A-Z0-9]{12}$/,
      CR: /^(CR[0-9]{2})\d{18}$/,
      CY: /^(CY[0-9]{2})\d{8}[A-Z0-9]{16}$/,
      CZ: /^(CZ[0-9]{2})\d{20}$/,
      DE: /^(DE[0-9]{2})\d{18}$/,
      DK: /^(DK[0-9]{2})\d{14}$/,
      DO: /^(DO[0-9]{2})[A-Z]{4}\d{20}$/,
      EE: /^(EE[0-9]{2})\d{16}$/,
      ES: /^(ES[0-9]{2})\d{20}$/,
      FI: /^(FI[0-9]{2})\d{14}$/,
      FO: /^(FO[0-9]{2})\d{14}$/,
      FR: /^(FR[0-9]{2})\d{10}[A-Z0-9]{11}\d{2}$/,
      GB: /^(GB[0-9]{2})[A-Z]{4}\d{14}$/,
      GE: /^(GE[0-9]{2})[A-Z0-9]{2}\d{16}$/,
      GI: /^(GI[0-9]{2})[A-Z]{4}[A-Z0-9]{15}$/,
      GL: /^(GL[0-9]{2})\d{14}$/,
      GR: /^(GR[0-9]{2})\d{7}[A-Z0-9]{16}$/,
      GT: /^(GT[0-9]{2})[A-Z0-9]{4}[A-Z0-9]{20}$/,
      HR: /^(HR[0-9]{2})\d{17}$/,
      HU: /^(HU[0-9]{2})\d{24}$/,
      IE: /^(IE[0-9]{2})[A-Z0-9]{4}\d{14}$/,
      IL: /^(IL[0-9]{2})\d{19}$/,
      IQ: /^(IQ[0-9]{2})[A-Z]{4}\d{15}$/,
      IR: /^(IR[0-9]{2})0\d{2}0\d{18}$/,
      IS: /^(IS[0-9]{2})\d{22}$/,
      IT: /^(IT[0-9]{2})[A-Z]{1}\d{10}[A-Z0-9]{12}$/,
      JO: /^(JO[0-9]{2})[A-Z]{4}\d{22}$/,
      KW: /^(KW[0-9]{2})[A-Z]{4}[A-Z0-9]{22}$/,
      KZ: /^(KZ[0-9]{2})\d{3}[A-Z0-9]{13}$/,
      LB: /^(LB[0-9]{2})\d{4}[A-Z0-9]{20}$/,
      LC: /^(LC[0-9]{2})[A-Z]{4}[A-Z0-9]{24}$/,
      LI: /^(LI[0-9]{2})\d{5}[A-Z0-9]{12}$/,
      LT: /^(LT[0-9]{2})\d{16}$/,
      LU: /^(LU[0-9]{2})\d{3}[A-Z0-9]{13}$/,
      LV: /^(LV[0-9]{2})[A-Z]{4}[A-Z0-9]{13}$/,
      MC: /^(MC[0-9]{2})\d{10}[A-Z0-9]{11}\d{2}$/,
      MD: /^(MD[0-9]{2})[A-Z0-9]{20}$/,
      ME: /^(ME[0-9]{2})\d{18}$/,
      MK: /^(MK[0-9]{2})\d{3}[A-Z0-9]{10}\d{2}$/,
      MR: /^(MR[0-9]{2})\d{23}$/,
      MT: /^(MT[0-9]{2})[A-Z]{4}\d{5}[A-Z0-9]{18}$/,
      MU: /^(MU[0-9]{2})[A-Z]{4}\d{19}[A-Z]{3}$/,
      NL: /^(NL[0-9]{2})[A-Z]{4}\d{10}$/,
      NO: /^(NO[0-9]{2})\d{11}$/,
      PK: /^(PK[0-9]{2})[A-Z0-9]{4}\d{16}$/,
      PL: /^(PL[0-9]{2})\d{24}$/,
      PS: /^(PS[0-9]{2})[A-Z0-9]{4}\d{21}$/,
      PT: /^(PT[0-9]{2})\d{21}$/,
      QA: /^(QA[0-9]{2})[A-Z]{4}[A-Z0-9]{21}$/,
      RO: /^(RO[0-9]{2})[A-Z]{4}[A-Z0-9]{16}$/,
      RS: /^(RS[0-9]{2})\d{18}$/,
      SA: /^(SA[0-9]{2})\d{2}[A-Z0-9]{18}$/,
      SC: /^(SC[0-9]{2})[A-Z]{4}\d{20}[A-Z]{3}$/,
      SE: /^(SE[0-9]{2})\d{20}$/,
      SI: /^(SI[0-9]{2})\d{15}$/,
      SK: /^(SK[0-9]{2})\d{20}$/,
      SM: /^(SM[0-9]{2})[A-Z]{1}\d{10}[A-Z0-9]{12}$/,
      TL: /^(TL[0-9]{2})\d{19}$/,
      TN: /^(TN[0-9]{2})\d{20}$/,
      TR: /^(TR[0-9]{2})\d{5}[A-Z0-9]{17}$/,
      UA: /^(UA[0-9]{2})\d{6}[A-Z0-9]{19}$/,
      VA: /^(VA[0-9]{2})\d{18}$/,
      VG: /^(VG[0-9]{2})[A-Z0-9]{4}\d{16}$/,
      XK: /^(XK[0-9]{2})\d{16}$/
    };
    /**
     * Check whether string has correct universal IBAN format
     * The IBAN consists of up to 34 alphanumeric characters, as follows:
     * Country Code using ISO 3166-1 alpha-2, two letters
     * check digits, two digits and
     * Basic Bank Account Number (BBAN), up to 30 alphanumeric characters.
     * NOTE: Permitted IBAN characters are: digits [0-9] and the 26 latin alphabetic [A-Z]
     *
     * @param {string} str - string under validation
     * @return {boolean}
     */

    function hasValidIbanFormat(str) {
      // Strip white spaces and hyphens
      var strippedStr = str.replace(/[\s\-]+/gi, '').toUpperCase();
      var isoCountryCode = strippedStr.slice(0, 2).toUpperCase();
      return isoCountryCode in ibanRegexThroughCountryCode && ibanRegexThroughCountryCode[isoCountryCode].test(strippedStr);
    }
    /**
       * Check whether string has valid IBAN Checksum
       * by performing basic mod-97 operation and
       * the remainder should equal 1
       * -- Start by rearranging the IBAN by moving the four initial characters to the end of the string
       * -- Replace each letter in the string with two digits, A -> 10, B = 11, Z = 35
       * -- Interpret the string as a decimal integer and
       * -- compute the remainder on division by 97 (mod 97)
       * Reference: https://en.wikipedia.org/wiki/International_Bank_Account_Number
       *
       * @param {string} str
       * @return {boolean}
       */


    function hasValidIbanChecksum(str) {
      var strippedStr = str.replace(/[^A-Z0-9]+/gi, '').toUpperCase(); // Keep only digits and A-Z latin alphabetic

      var rearranged = strippedStr.slice(4) + strippedStr.slice(0, 4);
      var alphaCapsReplacedWithDigits = rearranged.replace(/[A-Z]/g, function (char) {
        return char.charCodeAt(0) - 55;
      });
      var remainder = alphaCapsReplacedWithDigits.match(/\d{1,7}/g).reduce(function (acc, value) {
        return Number(acc + value) % 97;
      }, '');
      return remainder === 1;
    }

    function isIBAN(str) {
      (0, _assertString.default)(str);
      return hasValidIbanFormat(str) && hasValidIbanChecksum(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isIBAN_1);

    var isBIC_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isBIC;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var isBICReg = /^[A-z]{4}[A-z]{2}\w{2}(\w{3})?$/;

    function isBIC(str) {
      (0, _assertString.default)(str);
      return isBICReg.test(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isBIC_1);

    var isMD5_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isMD5;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var md5 = /^[a-f0-9]{32}$/;

    function isMD5(str) {
      (0, _assertString.default)(str);
      return md5.test(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isMD5_1);

    var isHash_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isHash;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var lengths = {
      md5: 32,
      md4: 32,
      sha1: 40,
      sha256: 64,
      sha384: 96,
      sha512: 128,
      ripemd128: 32,
      ripemd160: 40,
      tiger128: 32,
      tiger160: 40,
      tiger192: 48,
      crc32: 8,
      crc32b: 8
    };

    function isHash(str, algorithm) {
      (0, _assertString.default)(str);
      var hash = new RegExp("^[a-fA-F0-9]{".concat(lengths[algorithm], "}$"));
      return hash.test(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isHash_1);

    var isBase64_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isBase64;

    var _assertString = _interopRequireDefault(assertString_1);

    var _merge = _interopRequireDefault(merge_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var notBase64 = /[^A-Z0-9+\/=]/i;
    var urlSafeBase64 = /^[A-Z0-9_\-]+$/i;
    var defaultBase64Options = {
      urlSafe: false
    };

    function isBase64(str, options) {
      (0, _assertString.default)(str);
      options = (0, _merge.default)(options, defaultBase64Options);
      var len = str.length;

      if (options.urlSafe) {
        return urlSafeBase64.test(str);
      }

      if (!len || len % 4 !== 0 || notBase64.test(str)) {
        return false;
      }

      var firstPaddingChar = str.indexOf('=');
      return firstPaddingChar === -1 || firstPaddingChar === len - 1 || firstPaddingChar === len - 2 && str[len - 1] === '=';
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isBase64_1);

    var isJWT_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isJWT;

    var _assertString = _interopRequireDefault(assertString_1);

    var _isBase = _interopRequireDefault(isBase64_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function isJWT(str) {
      (0, _assertString.default)(str);
      var dotSplit = str.split('.');
      var len = dotSplit.length;

      if (len > 3 || len < 2) {
        return false;
      }

      return dotSplit.reduce(function (acc, currElem) {
        return acc && (0, _isBase.default)(currElem, {
          urlSafe: true
        });
      }, true);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isJWT_1);

    var isJSON_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isJSON;

    var _assertString = _interopRequireDefault(assertString_1);

    var _merge = _interopRequireDefault(merge_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

    var default_json_options = {
      allow_primitives: false
    };

    function isJSON(str, options) {
      (0, _assertString.default)(str);

      try {
        options = (0, _merge.default)(options, default_json_options);
        var primitives = [];

        if (options.allow_primitives) {
          primitives = [null, false, true];
        }

        var obj = JSON.parse(str);
        return primitives.includes(obj) || !!obj && _typeof(obj) === 'object';
      } catch (e) {
        /* ignore */
      }

      return false;
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isJSON_1);

    var isEmpty_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isEmpty;

    var _assertString = _interopRequireDefault(assertString_1);

    var _merge = _interopRequireDefault(merge_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var default_is_empty_options = {
      ignore_whitespace: false
    };

    function isEmpty(str, options) {
      (0, _assertString.default)(str);
      options = (0, _merge.default)(options, default_is_empty_options);
      return (options.ignore_whitespace ? str.trim().length : str.length) === 0;
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isEmpty_1);

    var isLength_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isLength;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

    /* eslint-disable prefer-rest-params */
    function isLength(str, options) {
      (0, _assertString.default)(str);
      var min;
      var max;

      if (_typeof(options) === 'object') {
        min = options.min || 0;
        max = options.max;
      } else {
        // backwards compatibility: isLength(str, min [, max])
        min = arguments[1] || 0;
        max = arguments[2];
      }

      var surrogatePairs = str.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g) || [];
      var len = str.length - surrogatePairs.length;
      return len >= min && (typeof max === 'undefined' || len <= max);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isLength_1);

    var isUUID_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isUUID;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var uuid = {
      3: /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
      4: /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
      5: /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
      all: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i
    };

    function isUUID(str) {
      var version = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'all';
      (0, _assertString.default)(str);
      var pattern = uuid[version];
      return pattern && pattern.test(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isUUID_1);

    var isMongoId_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isMongoId;

    var _assertString = _interopRequireDefault(assertString_1);

    var _isHexadecimal = _interopRequireDefault(isHexadecimal_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function isMongoId(str) {
      (0, _assertString.default)(str);
      return (0, _isHexadecimal.default)(str) && str.length === 24;
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isMongoId_1);

    var isAfter_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isAfter;

    var _assertString = _interopRequireDefault(assertString_1);

    var _toDate = _interopRequireDefault(toDate_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function isAfter(str) {
      var date = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : String(new Date());
      (0, _assertString.default)(str);
      var comparison = (0, _toDate.default)(date);
      var original = (0, _toDate.default)(str);
      return !!(original && comparison && original > comparison);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isAfter_1);

    var isBefore_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isBefore;

    var _assertString = _interopRequireDefault(assertString_1);

    var _toDate = _interopRequireDefault(toDate_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function isBefore(str) {
      var date = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : String(new Date());
      (0, _assertString.default)(str);
      var comparison = (0, _toDate.default)(date);
      var original = (0, _toDate.default)(str);
      return !!(original && comparison && original < comparison);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isBefore_1);

    var isIn_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isIn;

    var _assertString = _interopRequireDefault(assertString_1);

    var _toString = _interopRequireDefault(toString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

    function isIn(str, options) {
      (0, _assertString.default)(str);
      var i;

      if (Object.prototype.toString.call(options) === '[object Array]') {
        var array = [];

        for (i in options) {
          // https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md#ignoring-code-for-coverage-purposes
          // istanbul ignore else
          if ({}.hasOwnProperty.call(options, i)) {
            array[i] = (0, _toString.default)(options[i]);
          }
        }

        return array.indexOf(str) >= 0;
      } else if (_typeof(options) === 'object') {
        return options.hasOwnProperty(str);
      } else if (options && typeof options.indexOf === 'function') {
        return options.indexOf(str) >= 0;
      }

      return false;
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isIn_1);

    var isCreditCard_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isCreditCard;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    /* eslint-disable max-len */
    var creditCard = /^(?:4[0-9]{12}(?:[0-9]{3,6})?|5[1-5][0-9]{14}|(222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}|6(?:011|5[0-9][0-9])[0-9]{12,15}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11}|6[27][0-9]{14})$/;
    /* eslint-enable max-len */

    function isCreditCard(str) {
      (0, _assertString.default)(str);
      var sanitized = str.replace(/[- ]+/g, '');

      if (!creditCard.test(sanitized)) {
        return false;
      }

      var sum = 0;
      var digit;
      var tmpNum;
      var shouldDouble;

      for (var i = sanitized.length - 1; i >= 0; i--) {
        digit = sanitized.substring(i, i + 1);
        tmpNum = parseInt(digit, 10);

        if (shouldDouble) {
          tmpNum *= 2;

          if (tmpNum >= 10) {
            sum += tmpNum % 10 + 1;
          } else {
            sum += tmpNum;
          }
        } else {
          sum += tmpNum;
        }

        shouldDouble = !shouldDouble;
      }

      return !!(sum % 10 === 0 ? sanitized : false);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isCreditCard_1);

    var isIdentityCard_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isIdentityCard;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var validators = {
      ES: function ES(str) {
        (0, _assertString.default)(str);
        var DNI = /^[0-9X-Z][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
        var charsValue = {
          X: 0,
          Y: 1,
          Z: 2
        };
        var controlDigits = ['T', 'R', 'W', 'A', 'G', 'M', 'Y', 'F', 'P', 'D', 'X', 'B', 'N', 'J', 'Z', 'S', 'Q', 'V', 'H', 'L', 'C', 'K', 'E']; // sanitize user input

        var sanitized = str.trim().toUpperCase(); // validate the data structure

        if (!DNI.test(sanitized)) {
          return false;
        } // validate the control digit


        var number = sanitized.slice(0, -1).replace(/[X,Y,Z]/g, function (char) {
          return charsValue[char];
        });
        return sanitized.endsWith(controlDigits[number % 23]);
      },
      IN: function IN(str) {
        var DNI = /^[1-9]\d{3}\s?\d{4}\s?\d{4}$/; // multiplication table

        var d = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 0, 6, 7, 8, 9, 5], [2, 3, 4, 0, 1, 7, 8, 9, 5, 6], [3, 4, 0, 1, 2, 8, 9, 5, 6, 7], [4, 0, 1, 2, 3, 9, 5, 6, 7, 8], [5, 9, 8, 7, 6, 0, 4, 3, 2, 1], [6, 5, 9, 8, 7, 1, 0, 4, 3, 2], [7, 6, 5, 9, 8, 2, 1, 0, 4, 3], [8, 7, 6, 5, 9, 3, 2, 1, 0, 4], [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]]; // permutation table

        var p = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 5, 7, 6, 2, 8, 3, 0, 9, 4], [5, 8, 0, 3, 7, 9, 6, 1, 4, 2], [8, 9, 1, 6, 0, 4, 3, 5, 2, 7], [9, 4, 5, 3, 1, 2, 6, 8, 7, 0], [4, 2, 8, 6, 5, 7, 3, 9, 0, 1], [2, 7, 9, 3, 8, 0, 6, 4, 1, 5], [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]]; // sanitize user input

        var sanitized = str.trim(); // validate the data structure

        if (!DNI.test(sanitized)) {
          return false;
        }

        var c = 0;
        var invertedArray = sanitized.replace(/\s/g, '').split('').map(Number).reverse();
        invertedArray.forEach(function (val, i) {
          c = d[c][p[i % 8][val]];
        });
        return c === 0;
      },
      NO: function NO(str) {
        var sanitized = str.trim();
        if (isNaN(Number(sanitized))) return false;
        if (sanitized.length !== 11) return false;
        if (sanitized === '00000000000') return false; // https://no.wikipedia.org/wiki/F%C3%B8dselsnummer

        var f = sanitized.split('').map(Number);
        var k1 = (11 - (3 * f[0] + 7 * f[1] + 6 * f[2] + 1 * f[3] + 8 * f[4] + 9 * f[5] + 4 * f[6] + 5 * f[7] + 2 * f[8]) % 11) % 11;
        var k2 = (11 - (5 * f[0] + 4 * f[1] + 3 * f[2] + 2 * f[3] + 7 * f[4] + 6 * f[5] + 5 * f[6] + 4 * f[7] + 3 * f[8] + 2 * k1) % 11) % 11;

        if (k1 === 11) {
          k1 = 0;
        }

        if (k1 !== f[9] || k2 !== f[10]) return false;
        return true;
      },
      'he-IL': function heIL(str) {
        var DNI = /^\d{9}$/; // sanitize user input

        var sanitized = str.trim(); // validate the data structure

        if (!DNI.test(sanitized)) {
          return false;
        }

        var id = sanitized;
        var sum = 0,
            incNum;

        for (var i = 0; i < id.length; i++) {
          incNum = Number(id[i]) * (i % 2 + 1); // Multiply number by 1 or 2

          sum += incNum > 9 ? incNum - 9 : incNum; // Sum the digits up and add to total
        }

        return sum % 10 === 0;
      },
      'ar-TN': function arTN(str) {
        var DNI = /^\d{8}$/; // sanitize user input

        var sanitized = str.trim(); // validate the data structure

        if (!DNI.test(sanitized)) {
          return false;
        }

        return true;
      },
      'zh-CN': function zhCN(str) {
        var provinceAndCitys = {
          11: '北京',
          12: '天津',
          13: '河北',
          14: '山西',
          15: '内蒙古',
          21: '辽宁',
          22: '吉林',
          23: '黑龙江',
          31: '上海',
          32: '江苏',
          33: '浙江',
          34: '安徽',
          35: '福建',
          36: '江西',
          37: '山东',
          41: '河南',
          42: '湖北',
          43: '湖南',
          44: '广东',
          45: '广西',
          46: '海南',
          50: '重庆',
          51: '四川',
          52: '贵州',
          53: '云南',
          54: '西藏',
          61: '陕西',
          62: '甘肃',
          63: '青海',
          64: '宁夏',
          65: '新疆',
          71: '台湾',
          81: '香港',
          82: '澳门',
          91: '国外'
        };
        var powers = ['7', '9', '10', '5', '8', '4', '2', '1', '6', '3', '7', '9', '10', '5', '8', '4', '2'];
        var parityBit = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

        var checkAddressCode = function checkAddressCode(addressCode) {
          var check = /^[1-9]\d{5}$/.test(addressCode);
          if (!check) return false; // eslint-disable-next-line radix

          return !!provinceAndCitys[Number.parseInt(addressCode.substring(0, 2))];
        };

        var checkBirthDayCode = function checkBirthDayCode(birDayCode) {
          var check = /^[1-9]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))$/.test(birDayCode);
          if (!check) return false;
          var yyyy = parseInt(birDayCode.substring(0, 4), 10);
          var mm = parseInt(birDayCode.substring(4, 6), 10);
          var dd = parseInt(birDayCode.substring(6), 10);
          var xdata = new Date(yyyy, mm - 1, dd);

          if (xdata > new Date()) {
            return false; // eslint-disable-next-line max-len
          } else if (xdata.getFullYear() === yyyy && xdata.getMonth() === mm - 1 && xdata.getDate() === dd) {
            return true;
          }

          return false;
        };

        var getParityBit = function getParityBit(idCardNo) {
          var id17 = idCardNo.substring(0, 17);
          var power = 0;

          for (var i = 0; i < 17; i++) {
            // eslint-disable-next-line radix
            power += parseInt(id17.charAt(i), 10) * Number.parseInt(powers[i]);
          }

          var mod = power % 11;
          return parityBit[mod];
        };

        var checkParityBit = function checkParityBit(idCardNo) {
          return getParityBit(idCardNo) === idCardNo.charAt(17).toUpperCase();
        };

        var check15IdCardNo = function check15IdCardNo(idCardNo) {
          var check = /^[1-9]\d{7}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}$/.test(idCardNo);
          if (!check) return false;
          var addressCode = idCardNo.substring(0, 6);
          check = checkAddressCode(addressCode);
          if (!check) return false;
          var birDayCode = "19".concat(idCardNo.substring(6, 12));
          check = checkBirthDayCode(birDayCode);
          if (!check) return false;
          return checkParityBit(idCardNo);
        };

        var check18IdCardNo = function check18IdCardNo(idCardNo) {
          var check = /^[1-9]\d{5}[1-9]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}(\d|x|X)$/.test(idCardNo);
          if (!check) return false;
          var addressCode = idCardNo.substring(0, 6);
          check = checkAddressCode(addressCode);
          if (!check) return false;
          var birDayCode = idCardNo.substring(6, 14);
          check = checkBirthDayCode(birDayCode);
          if (!check) return false;
          return checkParityBit(idCardNo);
        };

        var checkIdCardNo = function checkIdCardNo(idCardNo) {
          var check = /^\d{15}|(\d{17}(\d|x|X))$/.test(idCardNo);
          if (!check) return false;

          if (idCardNo.length === 15) {
            return check15IdCardNo(idCardNo);
          } else if (idCardNo.length === 18) {
            return check18IdCardNo(idCardNo);
          }

          return false;
        };

        return checkIdCardNo(str);
      },
      'zh-TW': function zhTW(str) {
        var ALPHABET_CODES = {
          A: 10,
          B: 11,
          C: 12,
          D: 13,
          E: 14,
          F: 15,
          G: 16,
          H: 17,
          I: 34,
          J: 18,
          K: 19,
          L: 20,
          M: 21,
          N: 22,
          O: 35,
          P: 23,
          Q: 24,
          R: 25,
          S: 26,
          T: 27,
          U: 28,
          V: 29,
          W: 32,
          X: 30,
          Y: 31,
          Z: 33
        };
        var sanitized = str.trim().toUpperCase();
        if (!/^[A-Z][0-9]{9}$/.test(sanitized)) return false;
        return Array.from(sanitized).reduce(function (sum, number, index) {
          if (index === 0) {
            var code = ALPHABET_CODES[number];
            return code % 10 * 9 + Math.floor(code / 10);
          }

          if (index === 9) {
            return (10 - sum % 10 - Number(number)) % 10 === 0;
          }

          return sum + Number(number) * (9 - index);
        }, 0);
      }
    };

    function isIdentityCard(str, locale) {
      (0, _assertString.default)(str);

      if (locale in validators) {
        return validators[locale](str);
      } else if (locale === 'any') {
        for (var key in validators) {
          // https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md#ignoring-code-for-coverage-purposes
          // istanbul ignore else
          if (validators.hasOwnProperty(key)) {
            var validator = validators[key];

            if (validator(str)) {
              return true;
            }
          }
        }

        return false;
      }

      throw new Error("Invalid locale '".concat(locale, "'"));
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isIdentityCard_1);

    var isEAN_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isEAN;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    /**
     * The most commonly used EAN standard is
     * the thirteen-digit EAN-13, while the
     * less commonly used 8-digit EAN-8 barcode was
     * introduced for use on small packages.
     * EAN consists of:
     * GS1 prefix, manufacturer code, product code and check digit
     * Reference: https://en.wikipedia.org/wiki/International_Article_Number
     */

    /**
     * Define EAN Lenghts; 8 for EAN-8; 13 for EAN-13
     * and Regular Expression for valid EANs (EAN-8, EAN-13),
     * with exact numberic matching of 8 or 13 digits [0-9]
     */
    var LENGTH_EAN_8 = 8;
    var validEanRegex = /^(\d{8}|\d{13})$/;
    /**
     * Get position weight given:
     * EAN length and digit index/position
     *
     * @param {number} length
     * @param {number} index
     * @return {number}
     */

    function getPositionWeightThroughLengthAndIndex(length, index) {
      if (length === LENGTH_EAN_8) {
        return index % 2 === 0 ? 3 : 1;
      }

      return index % 2 === 0 ? 1 : 3;
    }
    /**
     * Calculate EAN Check Digit
     * Reference: https://en.wikipedia.org/wiki/International_Article_Number#Calculation_of_checksum_digit
     *
     * @param {string} ean
     * @return {number}
     */


    function calculateCheckDigit(ean) {
      var checksum = ean.slice(0, -1).split('').map(function (char, index) {
        return Number(char) * getPositionWeightThroughLengthAndIndex(ean.length, index);
      }).reduce(function (acc, partialSum) {
        return acc + partialSum;
      }, 0);
      var remainder = 10 - checksum % 10;
      return remainder < 10 ? remainder : 0;
    }
    /**
     * Check if string is valid EAN:
     * Matches EAN-8/EAN-13 regex
     * Has valid check digit.
     *
     * @param {string} str
     * @return {boolean}
     */


    function isEAN(str) {
      (0, _assertString.default)(str);
      var actualCheckDigit = Number(str.slice(-1));
      return validEanRegex.test(str) && actualCheckDigit === calculateCheckDigit(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isEAN_1);

    var isISIN_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isISIN;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var isin = /^[A-Z]{2}[0-9A-Z]{9}[0-9]$/;

    function isISIN(str) {
      (0, _assertString.default)(str);

      if (!isin.test(str)) {
        return false;
      }

      var checksumStr = str.replace(/[A-Z]/g, function (character) {
        return parseInt(character, 36);
      });
      var sum = 0;
      var digit;
      var tmpNum;
      var shouldDouble = true;

      for (var i = checksumStr.length - 2; i >= 0; i--) {
        digit = checksumStr.substring(i, i + 1);
        tmpNum = parseInt(digit, 10);

        if (shouldDouble) {
          tmpNum *= 2;

          if (tmpNum >= 10) {
            sum += tmpNum + 1;
          } else {
            sum += tmpNum;
          }
        } else {
          sum += tmpNum;
        }

        shouldDouble = !shouldDouble;
      }

      return parseInt(str.substr(str.length - 1), 10) === (10000 - sum) % 10;
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isISIN_1);

    var isISBN_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isISBN;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var isbn10Maybe = /^(?:[0-9]{9}X|[0-9]{10})$/;
    var isbn13Maybe = /^(?:[0-9]{13})$/;
    var factor = [1, 3];

    function isISBN(str) {
      var version = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      (0, _assertString.default)(str);
      version = String(version);

      if (!version) {
        return isISBN(str, 10) || isISBN(str, 13);
      }

      var sanitized = str.replace(/[\s-]+/g, '');
      var checksum = 0;
      var i;

      if (version === '10') {
        if (!isbn10Maybe.test(sanitized)) {
          return false;
        }

        for (i = 0; i < 9; i++) {
          checksum += (i + 1) * sanitized.charAt(i);
        }

        if (sanitized.charAt(9) === 'X') {
          checksum += 10 * 10;
        } else {
          checksum += 10 * sanitized.charAt(9);
        }

        if (checksum % 11 === 0) {
          return !!sanitized;
        }
      } else if (version === '13') {
        if (!isbn13Maybe.test(sanitized)) {
          return false;
        }

        for (i = 0; i < 12; i++) {
          checksum += factor[i % 2] * sanitized.charAt(i);
        }

        if (sanitized.charAt(12) - (10 - checksum % 10) % 10 === 0) {
          return !!sanitized;
        }
      }

      return false;
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isISBN_1);

    var isISSN_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isISSN;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var issn = '^\\d{4}-?\\d{3}[\\dX]$';

    function isISSN(str) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      (0, _assertString.default)(str);
      var testIssn = issn;
      testIssn = options.require_hyphen ? testIssn.replace('?', '') : testIssn;
      testIssn = options.case_sensitive ? new RegExp(testIssn) : new RegExp(testIssn, 'i');

      if (!testIssn.test(str)) {
        return false;
      }

      var digits = str.replace('-', '').toUpperCase();
      var checksum = 0;

      for (var i = 0; i < digits.length; i++) {
        var digit = digits[i];
        checksum += (digit === 'X' ? 10 : +digit) * (8 - i);
      }

      return checksum % 11 === 0;
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isISSN_1);

    var isTaxID_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isTaxID;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

    function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

    function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

    function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

    function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

    function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

    /**
     * An Employer Identification Number (EIN), also known as a Federal Tax Identification Number,
     *  is used to identify a business entity.
     *
     * NOTES:
     *  - Prefix 47 is being reserved for future use
     *  - Prefixes 26, 27, 45, 46 and 47 were previously assigned by the Philadelphia campus.
     *
     * See `http://www.irs.gov/Businesses/Small-Businesses-&-Self-Employed/How-EINs-are-Assigned-and-Valid-EIN-Prefixes`
     * for more information.
     */

    /**
     * Campus prefixes according to locales
     */
    var campusPrefix = {
      'en-US': {
        andover: ['10', '12'],
        atlanta: ['60', '67'],
        austin: ['50', '53'],
        brookhaven: ['01', '02', '03', '04', '05', '06', '11', '13', '14', '16', '21', '22', '23', '25', '34', '51', '52', '54', '55', '56', '57', '58', '59', '65'],
        cincinnati: ['30', '32', '35', '36', '37', '38', '61'],
        fresno: ['15', '24'],
        internet: ['20', '26', '27', '45', '46', '47'],
        kansas: ['40', '44'],
        memphis: ['94', '95'],
        ogden: ['80', '90'],
        philadelphia: ['33', '39', '41', '42', '43', '46', '48', '62', '63', '64', '66', '68', '71', '72', '73', '74', '75', '76', '77', '81', '82', '83', '84', '85', '86', '87', '88', '91', '92', '93', '98', '99'],
        sba: ['31']
      }
    };

    function getPrefixes(locale) {
      var prefixes = [];

      for (var location in campusPrefix[locale]) {
        if (campusPrefix[locale].hasOwnProperty(location)) {
          prefixes.push.apply(prefixes, _toConsumableArray(campusPrefix[locale][location]));
        }
      }

      prefixes.sort();
      return prefixes;
    } // tax id regex formats for various loacles


    var taxIdFormat = {
      'en-US': /^\d{2}[- ]{0,1}\d{7}$/
    };

    function isTaxID(str) {
      var locale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'en-US';
      (0, _assertString.default)(str);

      if (!taxIdFormat[locale].test(str)) {
        return false;
      }

      return getPrefixes(locale).indexOf(str.substr(0, 2)) !== -1;
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isTaxID_1);

    var isMobilePhone_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isMobilePhone;
    exports.locales = void 0;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    /* eslint-disable max-len */
    var phones = {
      'am-AM': /^(\+?374|0)((10|[9|7][0-9])\d{6}$|[2-4]\d{7}$)/,
      'ar-AE': /^((\+?971)|0)?5[024568]\d{7}$/,
      'ar-BH': /^(\+?973)?(3|6)\d{7}$/,
      'ar-DZ': /^(\+?213|0)(5|6|7)\d{8}$/,
      'ar-EG': /^((\+?20)|0)?1[0125]\d{8}$/,
      'ar-IQ': /^(\+?964|0)?7[0-9]\d{8}$/,
      'ar-JO': /^(\+?962|0)?7[789]\d{7}$/,
      'ar-KW': /^(\+?965)[569]\d{7}$/,
      'ar-LY': /^((\+?218)|0)?(9[1-6]\d{7}|[1-8]\d{7,9})$/,
      'ar-SA': /^(!?(\+?966)|0)?5\d{8}$/,
      'ar-SY': /^(!?(\+?963)|0)?9\d{8}$/,
      'ar-TN': /^(\+?216)?[2459]\d{7}$/,
      'be-BY': /^(\+?375)?(24|25|29|33|44)\d{7}$/,
      'bg-BG': /^(\+?359|0)?8[789]\d{7}$/,
      'bn-BD': /^(\+?880|0)1[13456789][0-9]{8}$/,
      'cs-CZ': /^(\+?420)? ?[1-9][0-9]{2} ?[0-9]{3} ?[0-9]{3}$/,
      'da-DK': /^(\+?45)?\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/,
      'de-DE': /^(\+49)?0?1(5[0-25-9]\d|6([23]|0\d?)|7([0-57-9]|6\d))\d{7}$/,
      'de-AT': /^(\+43|0)\d{1,4}\d{3,12}$/,
      'de-CH': /^(\+41|0)(7[5-9])\d{1,7}$/,
      'el-GR': /^(\+?30|0)?(69\d{8})$/,
      'en-AU': /^(\+?61|0)4\d{8}$/,
      'en-GB': /^(\+?44|0)7\d{9}$/,
      'en-GG': /^(\+?44|0)1481\d{6}$/,
      'en-GH': /^(\+233|0)(20|50|24|54|27|57|26|56|23|28)\d{7}$/,
      'en-HK': /^(\+?852[-\s]?)?[456789]\d{3}[-\s]?\d{4}$/,
      'en-MO': /^(\+?853[-\s]?)?[6]\d{3}[-\s]?\d{4}$/,
      'en-IE': /^(\+?353|0)8[356789]\d{7}$/,
      'en-IN': /^(\+?91|0)?[6789]\d{9}$/,
      'en-KE': /^(\+?254|0)(7|1)\d{8}$/,
      'en-MT': /^(\+?356|0)?(99|79|77|21|27|22|25)[0-9]{6}$/,
      'en-MU': /^(\+?230|0)?\d{8}$/,
      'en-NG': /^(\+?234|0)?[789]\d{9}$/,
      'en-NZ': /^(\+?64|0)[28]\d{7,9}$/,
      'en-PK': /^((\+92)|(0092))-{0,1}\d{3}-{0,1}\d{7}$|^\d{11}$|^\d{4}-\d{7}$/,
      'en-RW': /^(\+?250|0)?[7]\d{8}$/,
      'en-SG': /^(\+65)?[689]\d{7}$/,
      'en-SL': /^(?:0|94|\+94)?(7(0|1|2|5|6|7|8)( |-)?\d)\d{6}$/,
      'en-TZ': /^(\+?255|0)?[67]\d{8}$/,
      'en-UG': /^(\+?256|0)?[7]\d{8}$/,
      'en-US': /^((\+1|1)?( |-)?)?(\([2-9][0-9]{2}\)|[2-9][0-9]{2})( |-)?([2-9][0-9]{2}( |-)?[0-9]{4})$/,
      'en-ZA': /^(\+?27|0)\d{9}$/,
      'en-ZM': /^(\+?26)?09[567]\d{7}$/,
      'en-ZW': /^(\+263)[0-9]{9}$/,
      'es-CO': /^(\+?57)?([1-8]{1}|3[0-9]{2})?[2-9]{1}\d{6}$/,
      'es-CL': /^(\+?56|0)[2-9]\d{1}\d{7}$/,
      'es-CR': /^(\+506)?[2-8]\d{7}$/,
      'es-EC': /^(\+?593|0)([2-7]|9[2-9])\d{7}$/,
      'es-ES': /^(\+?34)?(6\d{1}|7[1234])\d{7}$/,
      'es-MX': /^(\+?52)?(1|01)?\d{10,11}$/,
      'es-PA': /^(\+?507)\d{7,8}$/,
      'es-PY': /^(\+?595|0)9[9876]\d{7}$/,
      'es-UY': /^(\+598|0)9[1-9][\d]{6}$/,
      'et-EE': /^(\+?372)?\s?(5|8[1-4])\s?([0-9]\s?){6,7}$/,
      'fa-IR': /^(\+?98[\-\s]?|0)9[0-39]\d[\-\s]?\d{3}[\-\s]?\d{4}$/,
      'fi-FI': /^(\+?358|0)\s?(4(0|1|2|4|5|6)?|50)\s?(\d\s?){4,8}\d$/,
      'fj-FJ': /^(\+?679)?\s?\d{3}\s?\d{4}$/,
      'fo-FO': /^(\+?298)?\s?\d{2}\s?\d{2}\s?\d{2}$/,
      'fr-FR': /^(\+?33|0)[67]\d{8}$/,
      'fr-GF': /^(\+?594|0|00594)[67]\d{8}$/,
      'fr-GP': /^(\+?590|0|00590)[67]\d{8}$/,
      'fr-MQ': /^(\+?596|0|00596)[67]\d{8}$/,
      'fr-RE': /^(\+?262|0|00262)[67]\d{8}$/,
      'he-IL': /^(\+972|0)([23489]|5[012345689]|77)[1-9]\d{6}$/,
      'hu-HU': /^(\+?36)(20|30|70)\d{7}$/,
      'id-ID': /^(\+?62|0)8(1[123456789]|2[1238]|3[1238]|5[12356789]|7[78]|9[56789]|8[123456789])([\s?|\d]{5,11})$/,
      'it-IT': /^(\+?39)?\s?3\d{2} ?\d{6,7}$/,
      'ja-JP': /^(\+81[ \-]?(\(0\))?|0)[6789]0[ \-]?\d{4}[ \-]?\d{4}$/,
      'kk-KZ': /^(\+?7|8)?7\d{9}$/,
      'kl-GL': /^(\+?299)?\s?\d{2}\s?\d{2}\s?\d{2}$/,
      'ko-KR': /^((\+?82)[ \-]?)?0?1([0|1|6|7|8|9]{1})[ \-]?\d{3,4}[ \-]?\d{4}$/,
      'lt-LT': /^(\+370|8)\d{8}$/,
      'ms-MY': /^(\+?6?01){1}(([0145]{1}(\-|\s)?\d{7,8})|([236789]{1}(\s|\-)?\d{7}))$/,
      'nb-NO': /^(\+?47)?[49]\d{7}$/,
      'ne-NP': /^(\+?977)?9[78]\d{8}$/,
      'nl-BE': /^(\+?32|0)4?\d{8}$/,
      'nl-NL': /^(((\+|00)?31\(0\))|((\+|00)?31)|0)6{1}\d{8}$/,
      'nn-NO': /^(\+?47)?[49]\d{7}$/,
      'pl-PL': /^(\+?48)? ?[5-8]\d ?\d{3} ?\d{2} ?\d{2}$/,
      'pt-BR': /(?=^(\+?5{2}\-?|0)[1-9]{2}\-?\d{4}\-?\d{4}$)(^(\+?5{2}\-?|0)[1-9]{2}\-?[6-9]{1}\d{3}\-?\d{4}$)|(^(\+?5{2}\-?|0)[1-9]{2}\-?9[6-9]{1}\d{3}\-?\d{4}$)/,
      'pt-PT': /^(\+?351)?9[1236]\d{7}$/,
      'ro-RO': /^(\+?4?0)\s?7\d{2}(\/|\s|\.|\-)?\d{3}(\s|\.|\-)?\d{3}$/,
      'ru-RU': /^(\+?7|8)?9\d{9}$/,
      'sl-SI': /^(\+386\s?|0)(\d{1}\s?\d{3}\s?\d{2}\s?\d{2}|\d{2}\s?\d{3}\s?\d{3})$/,
      'sk-SK': /^(\+?421)? ?[1-9][0-9]{2} ?[0-9]{3} ?[0-9]{3}$/,
      'sr-RS': /^(\+3816|06)[- \d]{5,9}$/,
      'sv-SE': /^(\+?46|0)[\s\-]?7[\s\-]?[02369]([\s\-]?\d){7}$/,
      'th-TH': /^(\+66|66|0)\d{9}$/,
      'tr-TR': /^(\+?90|0)?5\d{9}$/,
      'uk-UA': /^(\+?38|8)?0\d{9}$/,
      'vi-VN': /^(\+?84|0)((3([2-9]))|(5([2689]))|(7([0|6-9]))|(8([1-6|89]))|(9([0-9])))([0-9]{7})$/,
      'zh-CN': /^((\+|00)86)?1([3568][0-9]|4[579]|6[67]|7[01235678]|9[189])[0-9]{8}$/,
      'zh-TW': /^(\+?886\-?|0)?9\d{8}$/
    };
    /* eslint-enable max-len */
    // aliases

    phones['en-CA'] = phones['en-US'];
    phones['fr-BE'] = phones['nl-BE'];
    phones['zh-HK'] = phones['en-HK'];
    phones['zh-MO'] = phones['en-MO'];

    function isMobilePhone(str, locale, options) {
      (0, _assertString.default)(str);

      if (options && options.strictMode && !str.startsWith('+')) {
        return false;
      }

      if (Array.isArray(locale)) {
        return locale.some(function (key) {
          // https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md#ignoring-code-for-coverage-purposes
          // istanbul ignore else
          if (phones.hasOwnProperty(key)) {
            var phone = phones[key];

            if (phone.test(str)) {
              return true;
            }
          }

          return false;
        });
      } else if (locale in phones) {
        return phones[locale].test(str); // alias falsey locale as 'any'
      } else if (!locale || locale === 'any') {
        for (var key in phones) {
          // istanbul ignore else
          if (phones.hasOwnProperty(key)) {
            var phone = phones[key];

            if (phone.test(str)) {
              return true;
            }
          }
        }

        return false;
      }

      throw new Error("Invalid locale '".concat(locale, "'"));
    }

    var locales = Object.keys(phones);
    exports.locales = locales;
    });

    unwrapExports(isMobilePhone_1);
    var isMobilePhone_2 = isMobilePhone_1.locales;

    var isEthereumAddress_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isEthereumAddress;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var eth = /^(0x)[0-9a-f]{40}$/i;

    function isEthereumAddress(str) {
      (0, _assertString.default)(str);
      return eth.test(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isEthereumAddress_1);

    var isCurrency_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isCurrency;

    var _merge = _interopRequireDefault(merge_1);

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function currencyRegex(options) {
      var decimal_digits = "\\d{".concat(options.digits_after_decimal[0], "}");
      options.digits_after_decimal.forEach(function (digit, index) {
        if (index !== 0) decimal_digits = "".concat(decimal_digits, "|\\d{").concat(digit, "}");
      });
      var symbol = "(".concat(options.symbol.replace(/\W/, function (m) {
        return "\\".concat(m);
      }), ")").concat(options.require_symbol ? '' : '?'),
          negative = '-?',
          whole_dollar_amount_without_sep = '[1-9]\\d*',
          whole_dollar_amount_with_sep = "[1-9]\\d{0,2}(\\".concat(options.thousands_separator, "\\d{3})*"),
          valid_whole_dollar_amounts = ['0', whole_dollar_amount_without_sep, whole_dollar_amount_with_sep],
          whole_dollar_amount = "(".concat(valid_whole_dollar_amounts.join('|'), ")?"),
          decimal_amount = "(\\".concat(options.decimal_separator, "(").concat(decimal_digits, "))").concat(options.require_decimal ? '' : '?');
      var pattern = whole_dollar_amount + (options.allow_decimal || options.require_decimal ? decimal_amount : ''); // default is negative sign before symbol, but there are two other options (besides parens)

      if (options.allow_negatives && !options.parens_for_negatives) {
        if (options.negative_sign_after_digits) {
          pattern += negative;
        } else if (options.negative_sign_before_digits) {
          pattern = negative + pattern;
        }
      } // South African Rand, for example, uses R 123 (space) and R-123 (no space)


      if (options.allow_negative_sign_placeholder) {
        pattern = "( (?!\\-))?".concat(pattern);
      } else if (options.allow_space_after_symbol) {
        pattern = " ?".concat(pattern);
      } else if (options.allow_space_after_digits) {
        pattern += '( (?!$))?';
      }

      if (options.symbol_after_digits) {
        pattern += symbol;
      } else {
        pattern = symbol + pattern;
      }

      if (options.allow_negatives) {
        if (options.parens_for_negatives) {
          pattern = "(\\(".concat(pattern, "\\)|").concat(pattern, ")");
        } else if (!(options.negative_sign_before_digits || options.negative_sign_after_digits)) {
          pattern = negative + pattern;
        }
      } // ensure there's a dollar and/or decimal amount, and that
      // it doesn't start with a space or a negative sign followed by a space


      return new RegExp("^(?!-? )(?=.*\\d)".concat(pattern, "$"));
    }

    var default_currency_options = {
      symbol: '$',
      require_symbol: false,
      allow_space_after_symbol: false,
      symbol_after_digits: false,
      allow_negatives: true,
      parens_for_negatives: false,
      negative_sign_before_digits: false,
      negative_sign_after_digits: false,
      allow_negative_sign_placeholder: false,
      thousands_separator: ',',
      decimal_separator: '.',
      allow_decimal: true,
      require_decimal: false,
      digits_after_decimal: [2],
      allow_space_after_digits: false
    };

    function isCurrency(str, options) {
      (0, _assertString.default)(str);
      options = (0, _merge.default)(options, default_currency_options);
      return currencyRegex(options).test(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isCurrency_1);

    var isBtcAddress_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isBtcAddress;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    // supports Bech32 addresses
    var btc = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/;

    function isBtcAddress(str) {
      (0, _assertString.default)(str);
      return btc.test(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isBtcAddress_1);

    var isISO8601_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isISO8601;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    /* eslint-disable max-len */
    // from http://goo.gl/0ejHHW
    var iso8601 = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-3])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
    /* eslint-enable max-len */

    var isValidDate = function isValidDate(str) {
      // str must have passed the ISO8601 check
      // this check is meant to catch invalid dates
      // like 2009-02-31
      // first check for ordinal dates
      var ordinalMatch = str.match(/^(\d{4})-?(\d{3})([ T]{1}\.*|$)/);

      if (ordinalMatch) {
        var oYear = Number(ordinalMatch[1]);
        var oDay = Number(ordinalMatch[2]); // if is leap year

        if (oYear % 4 === 0 && oYear % 100 !== 0 || oYear % 400 === 0) return oDay <= 366;
        return oDay <= 365;
      }

      var match = str.match(/(\d{4})-?(\d{0,2})-?(\d*)/).map(Number);
      var year = match[1];
      var month = match[2];
      var day = match[3];
      var monthString = month ? "0".concat(month).slice(-2) : month;
      var dayString = day ? "0".concat(day).slice(-2) : day; // create a date object and compare

      var d = new Date("".concat(year, "-").concat(monthString || '01', "-").concat(dayString || '01'));

      if (month && day) {
        return d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month && d.getUTCDate() === day;
      }

      return true;
    };

    function isISO8601(str, options) {
      (0, _assertString.default)(str);
      var check = iso8601.test(str);
      if (!options) return check;
      if (check && options.strict) return isValidDate(str);
      return check;
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isISO8601_1);

    var isRFC3339_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isRFC3339;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    /* Based on https://tools.ietf.org/html/rfc3339#section-5.6 */
    var dateFullYear = /[0-9]{4}/;
    var dateMonth = /(0[1-9]|1[0-2])/;
    var dateMDay = /([12]\d|0[1-9]|3[01])/;
    var timeHour = /([01][0-9]|2[0-3])/;
    var timeMinute = /[0-5][0-9]/;
    var timeSecond = /([0-5][0-9]|60)/;
    var timeSecFrac = /(\.[0-9]+)?/;
    var timeNumOffset = new RegExp("[-+]".concat(timeHour.source, ":").concat(timeMinute.source));
    var timeOffset = new RegExp("([zZ]|".concat(timeNumOffset.source, ")"));
    var partialTime = new RegExp("".concat(timeHour.source, ":").concat(timeMinute.source, ":").concat(timeSecond.source).concat(timeSecFrac.source));
    var fullDate = new RegExp("".concat(dateFullYear.source, "-").concat(dateMonth.source, "-").concat(dateMDay.source));
    var fullTime = new RegExp("".concat(partialTime.source).concat(timeOffset.source));
    var rfc3339 = new RegExp("".concat(fullDate.source, "[ tT]").concat(fullTime.source));

    function isRFC3339(str) {
      (0, _assertString.default)(str);
      return rfc3339.test(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isRFC3339_1);

    var isISO31661Alpha2_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isISO31661Alpha2;

    var _assertString = _interopRequireDefault(assertString_1);

    var _includes = _interopRequireDefault(includes_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    // from https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
    var validISO31661Alpha2CountriesCodes = ['AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW'];

    function isISO31661Alpha2(str) {
      (0, _assertString.default)(str);
      return (0, _includes.default)(validISO31661Alpha2CountriesCodes, str.toUpperCase());
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isISO31661Alpha2_1);

    var isISO31661Alpha3_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isISO31661Alpha3;

    var _assertString = _interopRequireDefault(assertString_1);

    var _includes = _interopRequireDefault(includes_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    // from https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3
    var validISO31661Alpha3CountriesCodes = ['AFG', 'ALA', 'ALB', 'DZA', 'ASM', 'AND', 'AGO', 'AIA', 'ATA', 'ATG', 'ARG', 'ARM', 'ABW', 'AUS', 'AUT', 'AZE', 'BHS', 'BHR', 'BGD', 'BRB', 'BLR', 'BEL', 'BLZ', 'BEN', 'BMU', 'BTN', 'BOL', 'BES', 'BIH', 'BWA', 'BVT', 'BRA', 'IOT', 'BRN', 'BGR', 'BFA', 'BDI', 'KHM', 'CMR', 'CAN', 'CPV', 'CYM', 'CAF', 'TCD', 'CHL', 'CHN', 'CXR', 'CCK', 'COL', 'COM', 'COG', 'COD', 'COK', 'CRI', 'CIV', 'HRV', 'CUB', 'CUW', 'CYP', 'CZE', 'DNK', 'DJI', 'DMA', 'DOM', 'ECU', 'EGY', 'SLV', 'GNQ', 'ERI', 'EST', 'ETH', 'FLK', 'FRO', 'FJI', 'FIN', 'FRA', 'GUF', 'PYF', 'ATF', 'GAB', 'GMB', 'GEO', 'DEU', 'GHA', 'GIB', 'GRC', 'GRL', 'GRD', 'GLP', 'GUM', 'GTM', 'GGY', 'GIN', 'GNB', 'GUY', 'HTI', 'HMD', 'VAT', 'HND', 'HKG', 'HUN', 'ISL', 'IND', 'IDN', 'IRN', 'IRQ', 'IRL', 'IMN', 'ISR', 'ITA', 'JAM', 'JPN', 'JEY', 'JOR', 'KAZ', 'KEN', 'KIR', 'PRK', 'KOR', 'KWT', 'KGZ', 'LAO', 'LVA', 'LBN', 'LSO', 'LBR', 'LBY', 'LIE', 'LTU', 'LUX', 'MAC', 'MKD', 'MDG', 'MWI', 'MYS', 'MDV', 'MLI', 'MLT', 'MHL', 'MTQ', 'MRT', 'MUS', 'MYT', 'MEX', 'FSM', 'MDA', 'MCO', 'MNG', 'MNE', 'MSR', 'MAR', 'MOZ', 'MMR', 'NAM', 'NRU', 'NPL', 'NLD', 'NCL', 'NZL', 'NIC', 'NER', 'NGA', 'NIU', 'NFK', 'MNP', 'NOR', 'OMN', 'PAK', 'PLW', 'PSE', 'PAN', 'PNG', 'PRY', 'PER', 'PHL', 'PCN', 'POL', 'PRT', 'PRI', 'QAT', 'REU', 'ROU', 'RUS', 'RWA', 'BLM', 'SHN', 'KNA', 'LCA', 'MAF', 'SPM', 'VCT', 'WSM', 'SMR', 'STP', 'SAU', 'SEN', 'SRB', 'SYC', 'SLE', 'SGP', 'SXM', 'SVK', 'SVN', 'SLB', 'SOM', 'ZAF', 'SGS', 'SSD', 'ESP', 'LKA', 'SDN', 'SUR', 'SJM', 'SWZ', 'SWE', 'CHE', 'SYR', 'TWN', 'TJK', 'TZA', 'THA', 'TLS', 'TGO', 'TKL', 'TON', 'TTO', 'TUN', 'TUR', 'TKM', 'TCA', 'TUV', 'UGA', 'UKR', 'ARE', 'GBR', 'USA', 'UMI', 'URY', 'UZB', 'VUT', 'VEN', 'VNM', 'VGB', 'VIR', 'WLF', 'ESH', 'YEM', 'ZMB', 'ZWE'];

    function isISO31661Alpha3(str) {
      (0, _assertString.default)(str);
      return (0, _includes.default)(validISO31661Alpha3CountriesCodes, str.toUpperCase());
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isISO31661Alpha3_1);

    var isBase32_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isBase32;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var base32 = /^[A-Z2-7]+=*$/;

    function isBase32(str) {
      (0, _assertString.default)(str);
      var len = str.length;

      if (len > 0 && len % 8 === 0 && base32.test(str)) {
        return true;
      }

      return false;
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isBase32_1);

    var isDataURI_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isDataURI;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var validMediaType = /^[a-z]+\/[a-z0-9\-\+]+$/i;
    var validAttribute = /^[a-z\-]+=[a-z0-9\-]+$/i;
    var validData = /^[a-z0-9!\$&'\(\)\*\+,;=\-\._~:@\/\?%\s]*$/i;

    function isDataURI(str) {
      (0, _assertString.default)(str);
      var data = str.split(',');

      if (data.length < 2) {
        return false;
      }

      var attributes = data.shift().trim().split(';');
      var schemeAndMediaType = attributes.shift();

      if (schemeAndMediaType.substr(0, 5) !== 'data:') {
        return false;
      }

      var mediaType = schemeAndMediaType.substr(5);

      if (mediaType !== '' && !validMediaType.test(mediaType)) {
        return false;
      }

      for (var i = 0; i < attributes.length; i++) {
        if (i === attributes.length - 1 && attributes[i].toLowerCase() === 'base64') ; else if (!validAttribute.test(attributes[i])) {
          return false;
        }
      }

      for (var _i = 0; _i < data.length; _i++) {
        if (!validData.test(data[_i])) {
          return false;
        }
      }

      return true;
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isDataURI_1);

    var isMagnetURI_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isMagnetURI;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var magnetURI = /^magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32,40}&dn=.+&tr=.+$/i;

    function isMagnetURI(url) {
      (0, _assertString.default)(url);
      return magnetURI.test(url.trim());
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isMagnetURI_1);

    var isMimeType_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isMimeType;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    /*
      Checks if the provided string matches to a correct Media type format (MIME type)

      This function only checks is the string format follows the
      etablished rules by the according RFC specifications.
      This function supports 'charset' in textual media types
      (https://tools.ietf.org/html/rfc6657).

      This function does not check against all the media types listed
      by the IANA (https://www.iana.org/assignments/media-types/media-types.xhtml)
      because of lightness purposes : it would require to include
      all these MIME types in this librairy, which would weigh it
      significantly. This kind of effort maybe is not worth for the use that
      this function has in this entire librairy.

      More informations in the RFC specifications :
      - https://tools.ietf.org/html/rfc2045
      - https://tools.ietf.org/html/rfc2046
      - https://tools.ietf.org/html/rfc7231#section-3.1.1.1
      - https://tools.ietf.org/html/rfc7231#section-3.1.1.5
    */
    // Match simple MIME types
    // NB :
    //   Subtype length must not exceed 100 characters.
    //   This rule does not comply to the RFC specs (what is the max length ?).
    var mimeTypeSimple = /^(application|audio|font|image|message|model|multipart|text|video)\/[a-zA-Z0-9\.\-\+]{1,100}$/i; // eslint-disable-line max-len
    // Handle "charset" in "text/*"

    var mimeTypeText = /^text\/[a-zA-Z0-9\.\-\+]{1,100};\s?charset=("[a-zA-Z0-9\.\-\+\s]{0,70}"|[a-zA-Z0-9\.\-\+]{0,70})(\s?\([a-zA-Z0-9\.\-\+\s]{1,20}\))?$/i; // eslint-disable-line max-len
    // Handle "boundary" in "multipart/*"

    var mimeTypeMultipart = /^multipart\/[a-zA-Z0-9\.\-\+]{1,100}(;\s?(boundary|charset)=("[a-zA-Z0-9\.\-\+\s]{0,70}"|[a-zA-Z0-9\.\-\+]{0,70})(\s?\([a-zA-Z0-9\.\-\+\s]{1,20}\))?){0,2}$/i; // eslint-disable-line max-len

    function isMimeType(str) {
      (0, _assertString.default)(str);
      return mimeTypeSimple.test(str) || mimeTypeText.test(str) || mimeTypeMultipart.test(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isMimeType_1);

    var isLatLong_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isLatLong;

    var _assertString = _interopRequireDefault(assertString_1);

    var _merge = _interopRequireDefault(merge_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var lat = /^\(?[+-]?(90(\.0+)?|[1-8]?\d(\.\d+)?)$/;
    var long = /^\s?[+-]?(180(\.0+)?|1[0-7]\d(\.\d+)?|\d{1,2}(\.\d+)?)\)?$/;
    var latDMS = /^(([1-8]?\d)\D+([1-5]?\d|60)\D+([1-5]?\d|60)(\.\d+)?|90\D+0\D+0)\D+[NSns]?$/i;
    var longDMS = /^\s*([1-7]?\d{1,2}\D+([1-5]?\d|60)\D+([1-5]?\d|60)(\.\d+)?|180\D+0\D+0)\D+[EWew]?$/i;
    var defaultLatLongOptions = {
      checkDMS: false
    };

    function isLatLong(str, options) {
      (0, _assertString.default)(str);
      options = (0, _merge.default)(options, defaultLatLongOptions);
      if (!str.includes(',')) return false;
      var pair = str.split(',');
      if (pair[0].startsWith('(') && !pair[1].endsWith(')') || pair[1].endsWith(')') && !pair[0].startsWith('(')) return false;

      if (options.checkDMS) {
        return latDMS.test(pair[0]) && longDMS.test(pair[1]);
      }

      return lat.test(pair[0]) && long.test(pair[1]);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isLatLong_1);

    var isPostalCode_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isPostalCode;
    exports.locales = void 0;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    // common patterns
    var threeDigit = /^\d{3}$/;
    var fourDigit = /^\d{4}$/;
    var fiveDigit = /^\d{5}$/;
    var sixDigit = /^\d{6}$/;
    var patterns = {
      AD: /^AD\d{3}$/,
      AT: fourDigit,
      AU: fourDigit,
      BE: fourDigit,
      BG: fourDigit,
      BR: /^\d{5}-\d{3}$/,
      CA: /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][\s\-]?\d[ABCEGHJ-NPRSTV-Z]\d$/i,
      CH: fourDigit,
      CZ: /^\d{3}\s?\d{2}$/,
      DE: fiveDigit,
      DK: fourDigit,
      DZ: fiveDigit,
      EE: fiveDigit,
      ES: fiveDigit,
      FI: fiveDigit,
      FR: /^\d{2}\s?\d{3}$/,
      GB: /^(gir\s?0aa|[a-z]{1,2}\d[\da-z]?\s?(\d[a-z]{2})?)$/i,
      GR: /^\d{3}\s?\d{2}$/,
      HR: /^([1-5]\d{4}$)/,
      HU: fourDigit,
      ID: fiveDigit,
      IE: /^(?!.*(?:o))[A-z]\d[\dw]\s\w{4}$/i,
      IL: fiveDigit,
      IN: /^((?!10|29|35|54|55|65|66|86|87|88|89)[1-9][0-9]{5})$/,
      IS: threeDigit,
      IT: fiveDigit,
      JP: /^\d{3}\-\d{4}$/,
      KE: fiveDigit,
      LI: /^(948[5-9]|949[0-7])$/,
      LT: /^LT\-\d{5}$/,
      LU: fourDigit,
      LV: /^LV\-\d{4}$/,
      MX: fiveDigit,
      MT: /^[A-Za-z]{3}\s{0,1}\d{4}$/,
      NL: /^\d{4}\s?[a-z]{2}$/i,
      NO: fourDigit,
      NP: /^(10|21|22|32|33|34|44|45|56|57)\d{3}$|^(977)$/i,
      NZ: fourDigit,
      PL: /^\d{2}\-\d{3}$/,
      PR: /^00[679]\d{2}([ -]\d{4})?$/,
      PT: /^\d{4}\-\d{3}?$/,
      RO: sixDigit,
      RU: sixDigit,
      SA: fiveDigit,
      SE: /^[1-9]\d{2}\s?\d{2}$/,
      SI: fourDigit,
      SK: /^\d{3}\s?\d{2}$/,
      TN: fourDigit,
      TW: /^\d{3}(\d{2})?$/,
      UA: fiveDigit,
      US: /^\d{5}(-\d{4})?$/,
      ZA: fourDigit,
      ZM: fiveDigit
    };
    var locales = Object.keys(patterns);
    exports.locales = locales;

    function isPostalCode(str, locale) {
      (0, _assertString.default)(str);

      if (locale in patterns) {
        return patterns[locale].test(str);
      } else if (locale === 'any') {
        for (var key in patterns) {
          // https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md#ignoring-code-for-coverage-purposes
          // istanbul ignore else
          if (patterns.hasOwnProperty(key)) {
            var pattern = patterns[key];

            if (pattern.test(str)) {
              return true;
            }
          }
        }

        return false;
      }

      throw new Error("Invalid locale '".concat(locale, "'"));
    }
    });

    unwrapExports(isPostalCode_1);
    var isPostalCode_2 = isPostalCode_1.locales;

    var ltrim_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = ltrim;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function ltrim(str, chars) {
      (0, _assertString.default)(str); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping

      var pattern = chars ? new RegExp("^[".concat(chars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "]+"), 'g') : /^\s+/g;
      return str.replace(pattern, '');
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(ltrim_1);

    var rtrim_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = rtrim;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function rtrim(str, chars) {
      (0, _assertString.default)(str); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping

      var pattern = chars ? new RegExp("[".concat(chars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "]+$"), 'g') : /\s+$/g;
      return str.replace(pattern, '');
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(rtrim_1);

    var trim_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = trim;

    var _rtrim = _interopRequireDefault(rtrim_1);

    var _ltrim = _interopRequireDefault(ltrim_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function trim(str, chars) {
      return (0, _rtrim.default)((0, _ltrim.default)(str, chars), chars);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(trim_1);

    var _escape = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = escape;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function escape(str) {
      (0, _assertString.default)(str);
      return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\//g, '&#x2F;').replace(/\\/g, '&#x5C;').replace(/`/g, '&#96;');
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(_escape);

    var _unescape = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = unescape;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function unescape(str) {
      (0, _assertString.default)(str);
      return str.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#x2F;/g, '/').replace(/&#x5C;/g, '\\').replace(/&#96;/g, '`');
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(_unescape);

    var blacklist_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = blacklist;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function blacklist(str, chars) {
      (0, _assertString.default)(str);
      return str.replace(new RegExp("[".concat(chars, "]+"), 'g'), '');
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(blacklist_1);

    var stripLow_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = stripLow;

    var _assertString = _interopRequireDefault(assertString_1);

    var _blacklist = _interopRequireDefault(blacklist_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function stripLow(str, keep_new_lines) {
      (0, _assertString.default)(str);
      var chars = keep_new_lines ? '\\x00-\\x09\\x0B\\x0C\\x0E-\\x1F\\x7F' : '\\x00-\\x1F\\x7F';
      return (0, _blacklist.default)(str, chars);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(stripLow_1);

    var whitelist_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = whitelist;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function whitelist(str, chars) {
      (0, _assertString.default)(str);
      return str.replace(new RegExp("[^".concat(chars, "]+"), 'g'), '');
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(whitelist_1);

    var isWhitelisted_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isWhitelisted;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function isWhitelisted(str, chars) {
      (0, _assertString.default)(str);

      for (var i = str.length - 1; i >= 0; i--) {
        if (chars.indexOf(str[i]) === -1) {
          return false;
        }
      }

      return true;
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isWhitelisted_1);

    var normalizeEmail_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = normalizeEmail;

    var _merge = _interopRequireDefault(merge_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var default_normalize_email_options = {
      // The following options apply to all email addresses
      // Lowercases the local part of the email address.
      // Please note this may violate RFC 5321 as per http://stackoverflow.com/a/9808332/192024).
      // The domain is always lowercased, as per RFC 1035
      all_lowercase: true,
      // The following conversions are specific to GMail
      // Lowercases the local part of the GMail address (known to be case-insensitive)
      gmail_lowercase: true,
      // Removes dots from the local part of the email address, as that's ignored by GMail
      gmail_remove_dots: true,
      // Removes the subaddress (e.g. "+foo") from the email address
      gmail_remove_subaddress: true,
      // Conversts the googlemail.com domain to gmail.com
      gmail_convert_googlemaildotcom: true,
      // The following conversions are specific to Outlook.com / Windows Live / Hotmail
      // Lowercases the local part of the Outlook.com address (known to be case-insensitive)
      outlookdotcom_lowercase: true,
      // Removes the subaddress (e.g. "+foo") from the email address
      outlookdotcom_remove_subaddress: true,
      // The following conversions are specific to Yahoo
      // Lowercases the local part of the Yahoo address (known to be case-insensitive)
      yahoo_lowercase: true,
      // Removes the subaddress (e.g. "-foo") from the email address
      yahoo_remove_subaddress: true,
      // The following conversions are specific to Yandex
      // Lowercases the local part of the Yandex address (known to be case-insensitive)
      yandex_lowercase: true,
      // The following conversions are specific to iCloud
      // Lowercases the local part of the iCloud address (known to be case-insensitive)
      icloud_lowercase: true,
      // Removes the subaddress (e.g. "+foo") from the email address
      icloud_remove_subaddress: true
    }; // List of domains used by iCloud

    var icloud_domains = ['icloud.com', 'me.com']; // List of domains used by Outlook.com and its predecessors
    // This list is likely incomplete.
    // Partial reference:
    // https://blogs.office.com/2013/04/17/outlook-com-gets-two-step-verification-sign-in-by-alias-and-new-international-domains/

    var outlookdotcom_domains = ['hotmail.at', 'hotmail.be', 'hotmail.ca', 'hotmail.cl', 'hotmail.co.il', 'hotmail.co.nz', 'hotmail.co.th', 'hotmail.co.uk', 'hotmail.com', 'hotmail.com.ar', 'hotmail.com.au', 'hotmail.com.br', 'hotmail.com.gr', 'hotmail.com.mx', 'hotmail.com.pe', 'hotmail.com.tr', 'hotmail.com.vn', 'hotmail.cz', 'hotmail.de', 'hotmail.dk', 'hotmail.es', 'hotmail.fr', 'hotmail.hu', 'hotmail.id', 'hotmail.ie', 'hotmail.in', 'hotmail.it', 'hotmail.jp', 'hotmail.kr', 'hotmail.lv', 'hotmail.my', 'hotmail.ph', 'hotmail.pt', 'hotmail.sa', 'hotmail.sg', 'hotmail.sk', 'live.be', 'live.co.uk', 'live.com', 'live.com.ar', 'live.com.mx', 'live.de', 'live.es', 'live.eu', 'live.fr', 'live.it', 'live.nl', 'msn.com', 'outlook.at', 'outlook.be', 'outlook.cl', 'outlook.co.il', 'outlook.co.nz', 'outlook.co.th', 'outlook.com', 'outlook.com.ar', 'outlook.com.au', 'outlook.com.br', 'outlook.com.gr', 'outlook.com.pe', 'outlook.com.tr', 'outlook.com.vn', 'outlook.cz', 'outlook.de', 'outlook.dk', 'outlook.es', 'outlook.fr', 'outlook.hu', 'outlook.id', 'outlook.ie', 'outlook.in', 'outlook.it', 'outlook.jp', 'outlook.kr', 'outlook.lv', 'outlook.my', 'outlook.ph', 'outlook.pt', 'outlook.sa', 'outlook.sg', 'outlook.sk', 'passport.com']; // List of domains used by Yahoo Mail
    // This list is likely incomplete

    var yahoo_domains = ['rocketmail.com', 'yahoo.ca', 'yahoo.co.uk', 'yahoo.com', 'yahoo.de', 'yahoo.fr', 'yahoo.in', 'yahoo.it', 'ymail.com']; // List of domains used by yandex.ru

    var yandex_domains = ['yandex.ru', 'yandex.ua', 'yandex.kz', 'yandex.com', 'yandex.by', 'ya.ru']; // replace single dots, but not multiple consecutive dots

    function dotsReplacer(match) {
      if (match.length > 1) {
        return match;
      }

      return '';
    }

    function normalizeEmail(email, options) {
      options = (0, _merge.default)(options, default_normalize_email_options);
      var raw_parts = email.split('@');
      var domain = raw_parts.pop();
      var user = raw_parts.join('@');
      var parts = [user, domain]; // The domain is always lowercased, as it's case-insensitive per RFC 1035

      parts[1] = parts[1].toLowerCase();

      if (parts[1] === 'gmail.com' || parts[1] === 'googlemail.com') {
        // Address is GMail
        if (options.gmail_remove_subaddress) {
          parts[0] = parts[0].split('+')[0];
        }

        if (options.gmail_remove_dots) {
          // this does not replace consecutive dots like example..email@gmail.com
          parts[0] = parts[0].replace(/\.+/g, dotsReplacer);
        }

        if (!parts[0].length) {
          return false;
        }

        if (options.all_lowercase || options.gmail_lowercase) {
          parts[0] = parts[0].toLowerCase();
        }

        parts[1] = options.gmail_convert_googlemaildotcom ? 'gmail.com' : parts[1];
      } else if (icloud_domains.indexOf(parts[1]) >= 0) {
        // Address is iCloud
        if (options.icloud_remove_subaddress) {
          parts[0] = parts[0].split('+')[0];
        }

        if (!parts[0].length) {
          return false;
        }

        if (options.all_lowercase || options.icloud_lowercase) {
          parts[0] = parts[0].toLowerCase();
        }
      } else if (outlookdotcom_domains.indexOf(parts[1]) >= 0) {
        // Address is Outlook.com
        if (options.outlookdotcom_remove_subaddress) {
          parts[0] = parts[0].split('+')[0];
        }

        if (!parts[0].length) {
          return false;
        }

        if (options.all_lowercase || options.outlookdotcom_lowercase) {
          parts[0] = parts[0].toLowerCase();
        }
      } else if (yahoo_domains.indexOf(parts[1]) >= 0) {
        // Address is Yahoo
        if (options.yahoo_remove_subaddress) {
          var components = parts[0].split('-');
          parts[0] = components.length > 1 ? components.slice(0, -1).join('-') : components[0];
        }

        if (!parts[0].length) {
          return false;
        }

        if (options.all_lowercase || options.yahoo_lowercase) {
          parts[0] = parts[0].toLowerCase();
        }
      } else if (yandex_domains.indexOf(parts[1]) >= 0) {
        if (options.all_lowercase || options.yandex_lowercase) {
          parts[0] = parts[0].toLowerCase();
        }

        parts[1] = 'yandex.ru'; // all yandex domains are equal, 1st preffered
      } else if (options.all_lowercase) {
        // Any other address
        parts[0] = parts[0].toLowerCase();
      }

      return parts.join('@');
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(normalizeEmail_1);

    var isSlug_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isSlug;

    var _assertString = _interopRequireDefault(assertString_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var charsetRegex = /^[^\s-_](?!.*?[-_]{2,})([a-z0-9-\\]{1,})[^\s]*[^-_\s]$/;

    function isSlug(str) {
      (0, _assertString.default)(str);
      return charsetRegex.test(str);
    }

    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    unwrapExports(isSlug_1);

    var validator_1 = createCommonjsModule(function (module, exports) {

    function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;

    var _toDate = _interopRequireDefault(toDate_1);

    var _toFloat = _interopRequireDefault(toFloat_1);

    var _toInt = _interopRequireDefault(toInt_1);

    var _toBoolean = _interopRequireDefault(toBoolean_1);

    var _equals = _interopRequireDefault(equals_1);

    var _contains = _interopRequireDefault(contains_1);

    var _matches = _interopRequireDefault(matches_1);

    var _isEmail = _interopRequireDefault(isEmail_1);

    var _isURL = _interopRequireDefault(isURL_1);

    var _isMACAddress = _interopRequireDefault(isMACAddress_1);

    var _isIP = _interopRequireDefault(isIP_1);

    var _isIPRange = _interopRequireDefault(isIPRange_1);

    var _isFQDN = _interopRequireDefault(isFQDN_1);

    var _isDate = _interopRequireDefault(isDate_1);

    var _isBoolean = _interopRequireDefault(isBoolean_1);

    var _isLocale = _interopRequireDefault(isLocale_1);

    var _isAlpha = _interopRequireWildcard(isAlpha_1);

    var _isAlphanumeric = _interopRequireWildcard(isAlphanumeric_1);

    var _isNumeric = _interopRequireDefault(isNumeric_1);

    var _isPassportNumber = _interopRequireDefault(isPassportNumber_1);

    var _isPort = _interopRequireDefault(isPort_1);

    var _isLowercase = _interopRequireDefault(isLowercase_1);

    var _isUppercase = _interopRequireDefault(isUppercase_1);

    var _isIMEI = _interopRequireDefault(isIMEI_1);

    var _isAscii = _interopRequireDefault(isAscii_1);

    var _isFullWidth = _interopRequireDefault(isFullWidth_1);

    var _isHalfWidth = _interopRequireDefault(isHalfWidth_1);

    var _isVariableWidth = _interopRequireDefault(isVariableWidth_1);

    var _isMultibyte = _interopRequireDefault(isMultibyte_1);

    var _isSemVer = _interopRequireDefault(isSemVer_1);

    var _isSurrogatePair = _interopRequireDefault(isSurrogatePair_1);

    var _isInt = _interopRequireDefault(isInt_1);

    var _isFloat = _interopRequireWildcard(isFloat_1);

    var _isDecimal = _interopRequireDefault(isDecimal_1);

    var _isHexadecimal = _interopRequireDefault(isHexadecimal_1);

    var _isOctal = _interopRequireDefault(isOctal_1);

    var _isDivisibleBy = _interopRequireDefault(isDivisibleBy_1);

    var _isHexColor = _interopRequireDefault(isHexColor_1);

    var _isRgbColor = _interopRequireDefault(isRgbColor_1);

    var _isHSL = _interopRequireDefault(isHSL_1);

    var _isISRC = _interopRequireDefault(isISRC_1);

    var _isIBAN = _interopRequireDefault(isIBAN_1);

    var _isBIC = _interopRequireDefault(isBIC_1);

    var _isMD = _interopRequireDefault(isMD5_1);

    var _isHash = _interopRequireDefault(isHash_1);

    var _isJWT = _interopRequireDefault(isJWT_1);

    var _isJSON = _interopRequireDefault(isJSON_1);

    var _isEmpty = _interopRequireDefault(isEmpty_1);

    var _isLength = _interopRequireDefault(isLength_1);

    var _isByteLength = _interopRequireDefault(isByteLength_1);

    var _isUUID = _interopRequireDefault(isUUID_1);

    var _isMongoId = _interopRequireDefault(isMongoId_1);

    var _isAfter = _interopRequireDefault(isAfter_1);

    var _isBefore = _interopRequireDefault(isBefore_1);

    var _isIn = _interopRequireDefault(isIn_1);

    var _isCreditCard = _interopRequireDefault(isCreditCard_1);

    var _isIdentityCard = _interopRequireDefault(isIdentityCard_1);

    var _isEAN = _interopRequireDefault(isEAN_1);

    var _isISIN = _interopRequireDefault(isISIN_1);

    var _isISBN = _interopRequireDefault(isISBN_1);

    var _isISSN = _interopRequireDefault(isISSN_1);

    var _isTaxID = _interopRequireDefault(isTaxID_1);

    var _isMobilePhone = _interopRequireWildcard(isMobilePhone_1);

    var _isEthereumAddress = _interopRequireDefault(isEthereumAddress_1);

    var _isCurrency = _interopRequireDefault(isCurrency_1);

    var _isBtcAddress = _interopRequireDefault(isBtcAddress_1);

    var _isISO = _interopRequireDefault(isISO8601_1);

    var _isRFC = _interopRequireDefault(isRFC3339_1);

    var _isISO31661Alpha = _interopRequireDefault(isISO31661Alpha2_1);

    var _isISO31661Alpha2 = _interopRequireDefault(isISO31661Alpha3_1);

    var _isBase = _interopRequireDefault(isBase32_1);

    var _isBase2 = _interopRequireDefault(isBase64_1);

    var _isDataURI = _interopRequireDefault(isDataURI_1);

    var _isMagnetURI = _interopRequireDefault(isMagnetURI_1);

    var _isMimeType = _interopRequireDefault(isMimeType_1);

    var _isLatLong = _interopRequireDefault(isLatLong_1);

    var _isPostalCode = _interopRequireWildcard(isPostalCode_1);

    var _ltrim = _interopRequireDefault(ltrim_1);

    var _rtrim = _interopRequireDefault(rtrim_1);

    var _trim = _interopRequireDefault(trim_1);

    var _escape$1 = _interopRequireDefault(_escape);

    var _unescape$1 = _interopRequireDefault(_unescape);

    var _stripLow = _interopRequireDefault(stripLow_1);

    var _whitelist = _interopRequireDefault(whitelist_1);

    var _blacklist = _interopRequireDefault(blacklist_1);

    var _isWhitelisted = _interopRequireDefault(isWhitelisted_1);

    var _normalizeEmail = _interopRequireDefault(normalizeEmail_1);

    var _isSlug = _interopRequireDefault(isSlug_1);

    function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

    function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var version = '13.1.1';
    var validator = {
      version: version,
      toDate: _toDate.default,
      toFloat: _toFloat.default,
      toInt: _toInt.default,
      toBoolean: _toBoolean.default,
      equals: _equals.default,
      contains: _contains.default,
      matches: _matches.default,
      isEmail: _isEmail.default,
      isURL: _isURL.default,
      isMACAddress: _isMACAddress.default,
      isIP: _isIP.default,
      isIPRange: _isIPRange.default,
      isFQDN: _isFQDN.default,
      isBoolean: _isBoolean.default,
      isIBAN: _isIBAN.default,
      isBIC: _isBIC.default,
      isAlpha: _isAlpha.default,
      isAlphaLocales: _isAlpha.locales,
      isAlphanumeric: _isAlphanumeric.default,
      isAlphanumericLocales: _isAlphanumeric.locales,
      isNumeric: _isNumeric.default,
      isPassportNumber: _isPassportNumber.default,
      isPort: _isPort.default,
      isLowercase: _isLowercase.default,
      isUppercase: _isUppercase.default,
      isAscii: _isAscii.default,
      isFullWidth: _isFullWidth.default,
      isHalfWidth: _isHalfWidth.default,
      isVariableWidth: _isVariableWidth.default,
      isMultibyte: _isMultibyte.default,
      isSemVer: _isSemVer.default,
      isSurrogatePair: _isSurrogatePair.default,
      isInt: _isInt.default,
      isIMEI: _isIMEI.default,
      isFloat: _isFloat.default,
      isFloatLocales: _isFloat.locales,
      isDecimal: _isDecimal.default,
      isHexadecimal: _isHexadecimal.default,
      isOctal: _isOctal.default,
      isDivisibleBy: _isDivisibleBy.default,
      isHexColor: _isHexColor.default,
      isRgbColor: _isRgbColor.default,
      isHSL: _isHSL.default,
      isISRC: _isISRC.default,
      isMD5: _isMD.default,
      isHash: _isHash.default,
      isJWT: _isJWT.default,
      isJSON: _isJSON.default,
      isEmpty: _isEmpty.default,
      isLength: _isLength.default,
      isLocale: _isLocale.default,
      isByteLength: _isByteLength.default,
      isUUID: _isUUID.default,
      isMongoId: _isMongoId.default,
      isAfter: _isAfter.default,
      isBefore: _isBefore.default,
      isIn: _isIn.default,
      isCreditCard: _isCreditCard.default,
      isIdentityCard: _isIdentityCard.default,
      isEAN: _isEAN.default,
      isISIN: _isISIN.default,
      isISBN: _isISBN.default,
      isISSN: _isISSN.default,
      isMobilePhone: _isMobilePhone.default,
      isMobilePhoneLocales: _isMobilePhone.locales,
      isPostalCode: _isPostalCode.default,
      isPostalCodeLocales: _isPostalCode.locales,
      isEthereumAddress: _isEthereumAddress.default,
      isCurrency: _isCurrency.default,
      isBtcAddress: _isBtcAddress.default,
      isISO8601: _isISO.default,
      isRFC3339: _isRFC.default,
      isISO31661Alpha2: _isISO31661Alpha.default,
      isISO31661Alpha3: _isISO31661Alpha2.default,
      isBase32: _isBase.default,
      isBase64: _isBase2.default,
      isDataURI: _isDataURI.default,
      isMagnetURI: _isMagnetURI.default,
      isMimeType: _isMimeType.default,
      isLatLong: _isLatLong.default,
      ltrim: _ltrim.default,
      rtrim: _rtrim.default,
      trim: _trim.default,
      escape: _escape$1.default,
      unescape: _unescape$1.default,
      stripLow: _stripLow.default,
      whitelist: _whitelist.default,
      blacklist: _blacklist.default,
      isWhitelisted: _isWhitelisted.default,
      normalizeEmail: _normalizeEmail.default,
      toString: toString,
      isSlug: _isSlug.default,
      isTaxID: _isTaxID.default,
      isDate: _isDate.default
    };
    var _default = validator;
    exports.default = _default;
    module.exports = exports.default;
    module.exports.default = exports.default;
    });

    var validator = unwrapExports(validator_1);

    var LIB = /*#__PURE__*/function () {
      function LIB() {
        classCallCheck(this, LIB);

        this.lib = {};
      }
      /**
       *
       * @params {string}  mode what to do if element exists [replace|add|skip]
       */


      createClass(LIB, [{
        key: "add",
        value: function add(name, comp) {
          var mode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'replace';

          if (this.contain(name)) {
            if (mode === 'replace') {
              this.lib[name] = comp;
            } else if (mode === 'add') {
              this.lib[name] = Object.assign(this.lib[name], comp);
            }
          } else {
            this.lib[name] = comp;
          }
        }
      }, {
        key: "get",
        value: function get(name) {
          return this.lib[name];
        }
      }, {
        key: "contain",
        value: function contain(name) {
          return Object.prototype.hasOwnProperty.call(this.lib, name);
        }
      }, {
        key: "import",
        value: function _import(bulk) {
          for (var f in bulk) {
            FIELDS.add(f, bulk[f]);
          }
        }
      }]);

      return LIB;
    }();

    var FIELDS = new LIB();
    var COMPONENTS = new LIB();
    var VARIANTS = new LIB();

    /* src/form/form.svelte generated by Svelte v3.23.2 */

    function get_each_context$b(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[35] = list[i];
    	return child_ctx;
    }

    // (252:1) {:else}
    function create_else_block$e(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let div;
    	let t4;
    	let current;
    	let if_block0 = /*title*/ ctx[2] && create_if_block_6$2(ctx);
    	let if_block1 = /*description*/ ctx[3] && create_if_block_5$2(ctx);
    	let each_value = /*fields*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$b(get_each_context$b(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block2 = /*formErrors*/ ctx[9].length > 0 && create_if_block_3$a(ctx);
    	let if_block3 = /*cancel*/ ctx[5].enabled && create_if_block_2$b(ctx);
    	let if_block4 = /*submit*/ ctx[4].enabled && create_if_block_1$c(ctx);

    	return {
    		c() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			if (if_block2) if_block2.c();
    			t3 = space();
    			div = element("div");
    			if (if_block3) if_block3.c();
    			t4 = space();
    			if (if_block4) if_block4.c();
    			attr(div, "class", "buttons-row");
    		},
    		m(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, t1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, t2, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert(target, t3, anchor);
    			insert(target, div, anchor);
    			if (if_block3) if_block3.m(div, null);
    			append(div, t4);
    			if (if_block4) if_block4.m(div, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (/*title*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6$2(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*description*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_5$2(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty[0] & /*form, fields, onFieldChange*/ 4353) {
    				each_value = /*fields*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$b(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$b(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(t2.parentNode, t2);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*formErrors*/ ctx[9].length > 0) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_3$a(ctx);
    					if_block2.c();
    					if_block2.m(t3.parentNode, t3);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*cancel*/ ctx[5].enabled) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_2$b(ctx);
    					if_block3.c();
    					if_block3.m(div, t4);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*submit*/ ctx[4].enabled) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_1$c(ctx);
    					if_block4.c();
    					if_block4.m(div, null);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach(t1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(t2);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach(t3);
    			if (detaching) detach(div);
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    		}
    	};
    }

    // (248:1) {#if success}
    function create_if_block$g(ctx) {
    	let div;
    	let h3;
    	let t;

    	return {
    		c() {
    			div = element("div");
    			h3 = element("h3");
    			t = text(/*SUCCESS_TEXT*/ ctx[1]);
    			attr(h3, "class", "form-success-message");
    			attr(div, "class", "notification is-success");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h3);
    			append(h3, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*SUCCESS_TEXT*/ 2) set_data(t, /*SUCCESS_TEXT*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (253:1) {#if title }
    function create_if_block_6$2(ctx) {
    	let h5;
    	let t;

    	return {
    		c() {
    			h5 = element("h5");
    			t = text(/*title*/ ctx[2]);
    			attr(h5, "class", "title");
    		},
    		m(target, anchor) {
    			insert(target, h5, anchor);
    			append(h5, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*title*/ 4) set_data(t, /*title*/ ctx[2]);
    		},
    		d(detaching) {
    			if (detaching) detach(h5);
    		}
    	};
    }

    // (256:1) {#if description }
    function create_if_block_5$2(ctx) {
    	let h6;
    	let t;

    	return {
    		c() {
    			h6 = element("h6");
    			t = text(/*description*/ ctx[3]);
    			attr(h6, "class", "subtitle is-6");
    		},
    		m(target, anchor) {
    			insert(target, h6, anchor);
    			append(h6, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*description*/ 8) set_data(t, /*description*/ ctx[3]);
    		},
    		d(detaching) {
    			if (detaching) detach(h6);
    		}
    	};
    }

    // (263:1) {:else}
    function create_else_block_1$3(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*field*/ ctx[35] + "";
    	let t1;
    	let t2;

    	return {
    		c() {
    			div = element("div");
    			t0 = text("Field '");
    			t1 = text(t1_value);
    			t2 = text("' is not registered");
    			attr(div, "class", "is-danger");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t0);
    			append(div, t1);
    			append(div, t2);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*fields*/ 1 && t1_value !== (t1_value = /*field*/ ctx[35] + "")) set_data(t1, t1_value);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (261:1) {#if form[field] && form[field].component }
    function create_if_block_4$9(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*form*/ ctx[8][/*field*/ ctx[35]], { fieldname: /*field*/ ctx[35] }];
    	var switch_value = COMPONENTS.get(/*form*/ ctx[8][/*field*/ ctx[35]].component);

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return { props: switch_instance_props };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("change", /*onFieldChange*/ ctx[12]);
    	}

    	return {
    		c() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const switch_instance_changes = (dirty[0] & /*form, fields*/ 257)
    			? get_spread_update(switch_instance_spread_levels, [
    					get_spread_object(/*form*/ ctx[8][/*field*/ ctx[35]]),
    					dirty[0] & /*fields*/ 1 && { fieldname: /*field*/ ctx[35] }
    				])
    			: {};

    			if (switch_value !== (switch_value = COMPONENTS.get(/*form*/ ctx[8][/*field*/ ctx[35]].component))) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("change", /*onFieldChange*/ ctx[12]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    // (260:1) {#each fields as field}
    function create_each_block$b(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_4$9, create_else_block_1$3];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*form*/ ctx[8][/*field*/ ctx[35]] && /*form*/ ctx[8][/*field*/ ctx[35]].component) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (268:1) {#if formErrors.length > 0 }
    function create_if_block_3$a(ctx) {
    	let div;
    	let t_value = /*formErrors*/ ctx[9].join(", ") + "";
    	let t;

    	return {
    		c() {
    			div = element("div");
    			t = text(t_value);
    			attr(div, "class", "edit-form-error notification is-danger");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*formErrors*/ 512 && t_value !== (t_value = /*formErrors*/ ctx[9].join(", ") + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (273:2) {#if cancel.enabled}
    function create_if_block_2$b(ctx) {
    	let button;
    	let t_value = /*cancel*/ ctx[5].caption + "";
    	let t;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			t = text(t_value);
    			attr(button, "class", "button is-outlined");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t);

    			if (!mounted) {
    				dispose = listen(button, "click", function () {
    					if (is_function(/*rejectForm*/ ctx[7])) /*rejectForm*/ ctx[7].apply(this, arguments);
    				});

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*cancel*/ 32 && t_value !== (t_value = /*cancel*/ ctx[5].caption + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (276:2) {#if submit.enabled}
    function create_if_block_1$c(ctx) {
    	let button;
    	let t_value = /*submit*/ ctx[4].caption + "";
    	let t;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			t = text(t_value);
    			button.disabled = /*formInvalid*/ ctx[11];
    			attr(button, "class", "button is-primary is-hovered pull-right");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t);

    			if (!mounted) {
    				dispose = listen(button, "click", function () {
    					if (is_function(/*submitForm*/ ctx[6])) /*submitForm*/ ctx[6].apply(this, arguments);
    				});

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*submit*/ 16 && t_value !== (t_value = /*submit*/ ctx[4].caption + "")) set_data(t, t_value);

    			if (dirty[0] & /*formInvalid*/ 2048) {
    				button.disabled = /*formInvalid*/ ctx[11];
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$p(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$g, create_else_block$e];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*success*/ ctx[10]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			div = element("div");
    			if_block.c();
    			attr(div, "class", "container");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let dispatch = createEventDispatcher();
    	let form = {};

    	let validate = () => {
    		return { clean: true };
    	};
    	let formErrors = [];
    	let formHasErrors = false;
    	let fieldsHasErrors = false;
    	let success = false;

    	function fieldInit(type, mutation = {}) {
    		let field = {
    			label: "",
    			placeholder: "",
    			enabled: true,
    			value: "",
    			required: true,
    			validated: false,
    			valid: false,
    			errors: false,
    			variants: []
    		};

    		if (FIELDS.contain(type)) {
    			Object.assign(field, FIELDS.get(type));
    		}

    		if (mutation) {
    			Object.assign(field, mutation);
    		}

    		if (Object.prototype.hasOwnProperty.call(field, "variantsSource") && VARIANTS.contain(field.variantsSource)) {
    			field.variants = VARIANTS.get(field.variantsSource);
    		}

    		return field;
    	}

    	function collectData() {
    		let result = {};

    		fields.forEach(fieldname => {
    			if (Object.prototype.hasOwnProperty.call(form, fieldname) && form[fieldname].enabled) {
    				result[fieldname] = form[fieldname].value;
    			}
    		});

    		return result;
    	}

    	function setFieldInvalid(fieldName, value, errors) {
    		$$invalidate(8, form[fieldName].errors = errors, form);
    		$$invalidate(8, form[fieldName].validated = true, form);
    		$$invalidate(8, form[fieldName].valid = false, form);
    		$$invalidate(8, form[fieldName].value = value, form);
    		$$invalidate(8, form);
    		$$invalidate(30, fieldsHasErrors = true);
    	}

    	function setFieldValid(fieldName, value) {
    		$$invalidate(8, form[fieldName].errors = false, form);
    		$$invalidate(8, form[fieldName].validated = true, form);
    		$$invalidate(8, form[fieldName].valid = true, form);
    		$$invalidate(8, form[fieldName].value = value, form);
    		let some = false;

    		for (let fname in form) {
    			if (fname !== fieldName) {
    				if (Array.isArray(form[fname].errors) && form[fname].errors.length === 0) {
    					$$invalidate(8, form[fname].errors = false, form);
    				}

    				if (form[fname].errors !== false) {
    					console.log(fname, form[fname].errors);
    					some = true;
    					break;
    				}
    			}
    		}

    		$$invalidate(8, form);

    		if (fieldsHasErrors !== some) {
    			$$invalidate(30, fieldsHasErrors = some);
    		}
    	}

    	function fieldIsValid(fieldName) {
    		return !Array.isArray(form[fieldName].errors);
    	}

    	function setFormFieldInvalid(fieldName, errors) {
    		$$invalidate(8, form[fieldName].formErrors = [...errors], form);
    		$$invalidate(8, form[fieldName].validated = true, form);
    		$$invalidate(8, form[fieldName].formLevelError = true, form);
    		$$invalidate(8, form);
    	}

    	function setFormFieldValid(fieldName, value) {
    		$$invalidate(8, form[fieldName].formErrors = false, form);
    		$$invalidate(8, form[fieldName].validated = true, form);
    		$$invalidate(8, form[fieldName].formLevelError = false, form);
    		$$invalidate(8, form);
    	}

    	function fieldErrorsNotChanged(fieldName, errs) {
    		let oldErrs = form[fieldName].errors;

    		if (oldErrs === false && errs === false) {
    			return true;
    		} else {
    			if (Array.isArray(oldErrs) && Array.isArray(errs)) {
    				return oldErrs.join(". ") === errs.join(". ");
    			} else {
    				return false;
    			}
    		}
    	}

    	onMount(() => {
    		fields.forEach(fieldName => {
    			let opts = {};

    			if (Object.prototype.hasOwnProperty.call(options, "fields")) {
    				if (Object.prototype.hasOwnProperty.call(options.fields, fieldName)) {
    					opts = options.fields[fieldName];
    				}
    			}

    			$$invalidate(8, form[fieldName] = fieldInit(fieldName, opts), form);

    			if (options.readonly) {
    				$$invalidate(8, form[fieldName].readonly = true, form);
    			}
    		});

    		if (Object.prototype.hasOwnProperty.call(options, "validate") && typeof options.validate === "function") {
    			validate = options.validate;
    		}

    		$$invalidate(8, form);
    	});

    	function onFieldChange(ev) {
    		let data = ev.detail;

    		if (validation) {
    			//fields level validations
    			let res = typeof form[data.field].validate === "function"
    			? form[data.field].validate(data.value)
    			: [];

    			if (res.length === 0) {
    				setFieldValid(data.field, data.value);
    			} else {
    				setFieldInvalid(data.field, data.value, res);
    			}

    			//form level validations
    			let errors = validate(collectData());

    			if (!errors || errors.clean) {
    				formErrors.splice(0, formErrors.length);
    				$$invalidate(9, formErrors);
    				$$invalidate(29, formHasErrors = false);
    			} else {
    				if (errors.form.length === 0 && Object.keys(errors.fields).length === 0) {
    					$$invalidate(29, formHasErrors = false);

    					for (let fieldName in fields) {
    						setFormFieldValid(fieldName);
    					}
    				} else {
    					if (errors.form.length) {
    						errors.form.forEach(err => {
    							if (!formErrors.includes(err)) {
    								formErrors.push(err);
    							}
    						});

    						$$invalidate(9, formErrors);
    					} else {
    						formErrors.splice(0, formErrors.length);
    						$$invalidate(9, formErrors);
    					}

    					for (let fieldName of fields) {
    						if (Object.prototype.hasOwnProperty.call(errors.fields, fieldName)) {
    							setFormFieldInvalid(fieldName, errors.fields[fieldName]);
    						} else {
    							setFormFieldValid(fieldName);
    						}
    					}

    					$$invalidate(29, formHasErrors = true);
    				}
    			}
    		} else {
    			dispatch("change", data);
    		}
    	}

    	let { fields = [] } = $$props;
    	let { options = {} } = $$props;
    	let { validation = true } = $$props;
    	let { CLASS_OK = "is-success" } = $$props;
    	let { CLASS_ERR = "is-danger" } = $$props;
    	let { SUCCESS_TEXT = "Операция завершена" } = $$props;
    	let { title = "Форма" } = $$props;
    	let { description = "Заполните пожалуйста форму" } = $$props;
    	let { submit = { caption: "Отправить", enabled: true } } = $$props;
    	let { cancel = { caption: "Назад", enabled: true } } = $$props;
    	let { mode = "create" } = $$props;
    	let { loading = false } = $$props;

    	let { submitForm = e => {
    		e && e.preventDefault();
    		dispatch("submit", collectData());
    		return false;
    	} } = $$props;

    	function showSuccess() {
    		$$invalidate(10, success = true);
    	}

    	let { rejectForm = () => {
    		$$invalidate(13, loading = true);
    		dispatch("reject");
    	} } = $$props;

    	function setLoading() {
    		$$invalidate(13, loading = true);
    	}

    	function resetLoading() {
    		$$invalidate(13, loading = false);
    	}

    	$$self.$set = $$props => {
    		if ("fields" in $$props) $$invalidate(0, fields = $$props.fields);
    		if ("options" in $$props) $$invalidate(20, options = $$props.options);
    		if ("validation" in $$props) $$invalidate(21, validation = $$props.validation);
    		if ("CLASS_OK" in $$props) $$invalidate(22, CLASS_OK = $$props.CLASS_OK);
    		if ("CLASS_ERR" in $$props) $$invalidate(23, CLASS_ERR = $$props.CLASS_ERR);
    		if ("SUCCESS_TEXT" in $$props) $$invalidate(1, SUCCESS_TEXT = $$props.SUCCESS_TEXT);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("description" in $$props) $$invalidate(3, description = $$props.description);
    		if ("submit" in $$props) $$invalidate(4, submit = $$props.submit);
    		if ("cancel" in $$props) $$invalidate(5, cancel = $$props.cancel);
    		if ("mode" in $$props) $$invalidate(24, mode = $$props.mode);
    		if ("loading" in $$props) $$invalidate(13, loading = $$props.loading);
    		if ("submitForm" in $$props) $$invalidate(6, submitForm = $$props.submitForm);
    		if ("rejectForm" in $$props) $$invalidate(7, rejectForm = $$props.rejectForm);
    	};

    	let formInvalid;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*formHasErrors, fieldsHasErrors*/ 1610612736) {
    			 $$invalidate(11, formInvalid = formHasErrors || fieldsHasErrors);
    		}
    	};

    	return [
    		fields,
    		SUCCESS_TEXT,
    		title,
    		description,
    		submit,
    		cancel,
    		submitForm,
    		rejectForm,
    		form,
    		formErrors,
    		success,
    		formInvalid,
    		onFieldChange,
    		loading,
    		setFieldInvalid,
    		setFieldValid,
    		fieldIsValid,
    		setFormFieldInvalid,
    		setFormFieldValid,
    		fieldErrorsNotChanged,
    		options,
    		validation,
    		CLASS_OK,
    		CLASS_ERR,
    		mode,
    		showSuccess,
    		setLoading,
    		resetLoading
    	];
    }

    class Form extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(
    			this,
    			options,
    			instance$p,
    			create_fragment$p,
    			safe_not_equal,
    			{
    				setFieldInvalid: 14,
    				setFieldValid: 15,
    				fieldIsValid: 16,
    				setFormFieldInvalid: 17,
    				setFormFieldValid: 18,
    				fieldErrorsNotChanged: 19,
    				fields: 0,
    				options: 20,
    				validation: 21,
    				CLASS_OK: 22,
    				CLASS_ERR: 23,
    				SUCCESS_TEXT: 1,
    				title: 2,
    				description: 3,
    				submit: 4,
    				cancel: 5,
    				mode: 24,
    				loading: 13,
    				submitForm: 6,
    				showSuccess: 25,
    				rejectForm: 7,
    				setLoading: 26,
    				resetLoading: 27
    			},
    			[-1, -1]
    		);
    	}

    	get setFieldInvalid() {
    		return this.$$.ctx[14];
    	}

    	get setFieldValid() {
    		return this.$$.ctx[15];
    	}

    	get fieldIsValid() {
    		return this.$$.ctx[16];
    	}

    	get setFormFieldInvalid() {
    		return this.$$.ctx[17];
    	}

    	get setFormFieldValid() {
    		return this.$$.ctx[18];
    	}

    	get fieldErrorsNotChanged() {
    		return this.$$.ctx[19];
    	}

    	get showSuccess() {
    		return this.$$.ctx[25];
    	}

    	get setLoading() {
    		return this.$$.ctx[26];
    	}

    	get resetLoading() {
    		return this.$$.ctx[27];
    	}
    }

    var Form$1 = /*#__PURE__*/function () {
      function Form$1() {
        classCallCheck(this, Form$1);
      }

      createClass(Form$1, null, [{
        key: "addComponent",
        value: function addComponent(name, value) {
          COMPONENTS.add(name, value);
        }
      }, {
        key: "addVariants",
        value: function addVariants(name, value) {
          VARIANTS.add(name, value);
        }
      }, {
        key: "addField",
        value: function addField(name, field) {
          FIELDS.add(name, field);
        }
      }, {
        key: "build",
        value: function build(_ref) {
          var target = _ref.target,
              manifest = _ref.manifest,
              action = _ref.action,
              _ref$options = _ref.options,
              options = _ref$options === void 0 ? {} : _ref$options,
              _ref$validators = _ref.validators,
              validators = _ref$validators === void 0 ? {} : _ref$validators,
              _ref$data = _ref.data,
              data = _ref$data === void 0 ? null : _ref$data;

          if (Object.prototype.hasOwnProperty.call(manifest, 'fields')) {
            FIELDS.import(manifest.fields);
          }

          if (typeof options === 'undefined' || options === null) {
            options = {};
          }

          if (manifest.actions[action].fields) {
            manifest.actions[action].fields.forEach(function (fieldName) {
              if (!Object.prototype.hasOwnProperty.call(options, 'fields')) {
                options.fields = {};
              }

              if (!Object.prototype.hasOwnProperty.call(options.fields, fieldName)) {
                options.fields[fieldName] = {};
              } //copying validators


              if (validators && validators.fields && Object.prototype.hasOwnProperty.call(validators.fields, fieldName)) {
                options.fields[fieldName].validate = validators.fields[fieldName];
              } //copying initial data


              if (typeof data !== 'undefined' && data !== null && typeof data[fieldName] !== 'undefined' && data[fieldName] !== null) {
                options.fields[fieldName].value = data[fieldName];
              }
            });
          }

          if (typeof validators !== 'undefined' && validators !== null) {
            if (Object.prototype.hasOwnProperty.call(validators, 'forms')) {
              if (Object.prototype.hasOwnProperty.call(validators.forms, action)) {
                options.validate = validators.forms[action];
              }
            }
          }

          return new Form({
            target: target,
            props: {
              title: manifest.actions[action].title,
              description: manifest.actions[action].description,
              fields: manifest.actions[action].fields,
              options: options
            }
          });
        }
      }, {
        key: "getVariantTitle",
        value: function getVariantTitle(name, id) {
          var lib = VARIANTS.get(name);
          var result = lib.filter(function (item) {
            return item.id === id;
          });
          return result.length === 1 ? result[0] : 'noname';
        }
      }]);

      return Form$1;
    }();

    defineProperty(Form$1, "validator", validator);

    var runtime_1 = createCommonjsModule(function (module) {
    /**
     * Copyright (c) 2014-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */

    var runtime = (function (exports) {

      var Op = Object.prototype;
      var hasOwn = Op.hasOwnProperty;
      var undefined$1; // More compressible than void 0.
      var $Symbol = typeof Symbol === "function" ? Symbol : {};
      var iteratorSymbol = $Symbol.iterator || "@@iterator";
      var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
      var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

      function wrap(innerFn, outerFn, self, tryLocsList) {
        // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
        var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
        var generator = Object.create(protoGenerator.prototype);
        var context = new Context(tryLocsList || []);

        // The ._invoke method unifies the implementations of the .next,
        // .throw, and .return methods.
        generator._invoke = makeInvokeMethod(innerFn, self, context);

        return generator;
      }
      exports.wrap = wrap;

      // Try/catch helper to minimize deoptimizations. Returns a completion
      // record like context.tryEntries[i].completion. This interface could
      // have been (and was previously) designed to take a closure to be
      // invoked without arguments, but in all the cases we care about we
      // already have an existing method we want to call, so there's no need
      // to create a new function object. We can even get away with assuming
      // the method takes exactly one argument, since that happens to be true
      // in every case, so we don't have to touch the arguments object. The
      // only additional allocation required is the completion record, which
      // has a stable shape and so hopefully should be cheap to allocate.
      function tryCatch(fn, obj, arg) {
        try {
          return { type: "normal", arg: fn.call(obj, arg) };
        } catch (err) {
          return { type: "throw", arg: err };
        }
      }

      var GenStateSuspendedStart = "suspendedStart";
      var GenStateSuspendedYield = "suspendedYield";
      var GenStateExecuting = "executing";
      var GenStateCompleted = "completed";

      // Returning this object from the innerFn has the same effect as
      // breaking out of the dispatch switch statement.
      var ContinueSentinel = {};

      // Dummy constructor functions that we use as the .constructor and
      // .constructor.prototype properties for functions that return Generator
      // objects. For full spec compliance, you may wish to configure your
      // minifier not to mangle the names of these two functions.
      function Generator() {}
      function GeneratorFunction() {}
      function GeneratorFunctionPrototype() {}

      // This is a polyfill for %IteratorPrototype% for environments that
      // don't natively support it.
      var IteratorPrototype = {};
      IteratorPrototype[iteratorSymbol] = function () {
        return this;
      };

      var getProto = Object.getPrototypeOf;
      var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
      if (NativeIteratorPrototype &&
          NativeIteratorPrototype !== Op &&
          hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
        // This environment has a native %IteratorPrototype%; use it instead
        // of the polyfill.
        IteratorPrototype = NativeIteratorPrototype;
      }

      var Gp = GeneratorFunctionPrototype.prototype =
        Generator.prototype = Object.create(IteratorPrototype);
      GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
      GeneratorFunctionPrototype.constructor = GeneratorFunction;
      GeneratorFunctionPrototype[toStringTagSymbol] =
        GeneratorFunction.displayName = "GeneratorFunction";

      // Helper for defining the .next, .throw, and .return methods of the
      // Iterator interface in terms of a single ._invoke method.
      function defineIteratorMethods(prototype) {
        ["next", "throw", "return"].forEach(function(method) {
          prototype[method] = function(arg) {
            return this._invoke(method, arg);
          };
        });
      }

      exports.isGeneratorFunction = function(genFun) {
        var ctor = typeof genFun === "function" && genFun.constructor;
        return ctor
          ? ctor === GeneratorFunction ||
            // For the native GeneratorFunction constructor, the best we can
            // do is to check its .name property.
            (ctor.displayName || ctor.name) === "GeneratorFunction"
          : false;
      };

      exports.mark = function(genFun) {
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
        } else {
          genFun.__proto__ = GeneratorFunctionPrototype;
          if (!(toStringTagSymbol in genFun)) {
            genFun[toStringTagSymbol] = "GeneratorFunction";
          }
        }
        genFun.prototype = Object.create(Gp);
        return genFun;
      };

      // Within the body of any async function, `await x` is transformed to
      // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
      // `hasOwn.call(value, "__await")` to determine if the yielded value is
      // meant to be awaited.
      exports.awrap = function(arg) {
        return { __await: arg };
      };

      function AsyncIterator(generator, PromiseImpl) {
        function invoke(method, arg, resolve, reject) {
          var record = tryCatch(generator[method], generator, arg);
          if (record.type === "throw") {
            reject(record.arg);
          } else {
            var result = record.arg;
            var value = result.value;
            if (value &&
                typeof value === "object" &&
                hasOwn.call(value, "__await")) {
              return PromiseImpl.resolve(value.__await).then(function(value) {
                invoke("next", value, resolve, reject);
              }, function(err) {
                invoke("throw", err, resolve, reject);
              });
            }

            return PromiseImpl.resolve(value).then(function(unwrapped) {
              // When a yielded Promise is resolved, its final value becomes
              // the .value of the Promise<{value,done}> result for the
              // current iteration.
              result.value = unwrapped;
              resolve(result);
            }, function(error) {
              // If a rejected Promise was yielded, throw the rejection back
              // into the async generator function so it can be handled there.
              return invoke("throw", error, resolve, reject);
            });
          }
        }

        var previousPromise;

        function enqueue(method, arg) {
          function callInvokeWithMethodAndArg() {
            return new PromiseImpl(function(resolve, reject) {
              invoke(method, arg, resolve, reject);
            });
          }

          return previousPromise =
            // If enqueue has been called before, then we want to wait until
            // all previous Promises have been resolved before calling invoke,
            // so that results are always delivered in the correct order. If
            // enqueue has not been called before, then it is important to
            // call invoke immediately, without waiting on a callback to fire,
            // so that the async generator function has the opportunity to do
            // any necessary setup in a predictable way. This predictability
            // is why the Promise constructor synchronously invokes its
            // executor callback, and why async functions synchronously
            // execute code before the first await. Since we implement simple
            // async functions in terms of async generators, it is especially
            // important to get this right, even though it requires care.
            previousPromise ? previousPromise.then(
              callInvokeWithMethodAndArg,
              // Avoid propagating failures to Promises returned by later
              // invocations of the iterator.
              callInvokeWithMethodAndArg
            ) : callInvokeWithMethodAndArg();
        }

        // Define the unified helper method that is used to implement .next,
        // .throw, and .return (see defineIteratorMethods).
        this._invoke = enqueue;
      }

      defineIteratorMethods(AsyncIterator.prototype);
      AsyncIterator.prototype[asyncIteratorSymbol] = function () {
        return this;
      };
      exports.AsyncIterator = AsyncIterator;

      // Note that simple async functions are implemented on top of
      // AsyncIterator objects; they just return a Promise for the value of
      // the final result produced by the iterator.
      exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
        if (PromiseImpl === void 0) PromiseImpl = Promise;

        var iter = new AsyncIterator(
          wrap(innerFn, outerFn, self, tryLocsList),
          PromiseImpl
        );

        return exports.isGeneratorFunction(outerFn)
          ? iter // If outerFn is a generator, return the full iterator.
          : iter.next().then(function(result) {
              return result.done ? result.value : iter.next();
            });
      };

      function makeInvokeMethod(innerFn, self, context) {
        var state = GenStateSuspendedStart;

        return function invoke(method, arg) {
          if (state === GenStateExecuting) {
            throw new Error("Generator is already running");
          }

          if (state === GenStateCompleted) {
            if (method === "throw") {
              throw arg;
            }

            // Be forgiving, per 25.3.3.3.3 of the spec:
            // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
            return doneResult();
          }

          context.method = method;
          context.arg = arg;

          while (true) {
            var delegate = context.delegate;
            if (delegate) {
              var delegateResult = maybeInvokeDelegate(delegate, context);
              if (delegateResult) {
                if (delegateResult === ContinueSentinel) continue;
                return delegateResult;
              }
            }

            if (context.method === "next") {
              // Setting context._sent for legacy support of Babel's
              // function.sent implementation.
              context.sent = context._sent = context.arg;

            } else if (context.method === "throw") {
              if (state === GenStateSuspendedStart) {
                state = GenStateCompleted;
                throw context.arg;
              }

              context.dispatchException(context.arg);

            } else if (context.method === "return") {
              context.abrupt("return", context.arg);
            }

            state = GenStateExecuting;

            var record = tryCatch(innerFn, self, context);
            if (record.type === "normal") {
              // If an exception is thrown from innerFn, we leave state ===
              // GenStateExecuting and loop back for another invocation.
              state = context.done
                ? GenStateCompleted
                : GenStateSuspendedYield;

              if (record.arg === ContinueSentinel) {
                continue;
              }

              return {
                value: record.arg,
                done: context.done
              };

            } else if (record.type === "throw") {
              state = GenStateCompleted;
              // Dispatch the exception by looping back around to the
              // context.dispatchException(context.arg) call above.
              context.method = "throw";
              context.arg = record.arg;
            }
          }
        };
      }

      // Call delegate.iterator[context.method](context.arg) and handle the
      // result, either by returning a { value, done } result from the
      // delegate iterator, or by modifying context.method and context.arg,
      // setting context.delegate to null, and returning the ContinueSentinel.
      function maybeInvokeDelegate(delegate, context) {
        var method = delegate.iterator[context.method];
        if (method === undefined$1) {
          // A .throw or .return when the delegate iterator has no .throw
          // method always terminates the yield* loop.
          context.delegate = null;

          if (context.method === "throw") {
            // Note: ["return"] must be used for ES3 parsing compatibility.
            if (delegate.iterator["return"]) {
              // If the delegate iterator has a return method, give it a
              // chance to clean up.
              context.method = "return";
              context.arg = undefined$1;
              maybeInvokeDelegate(delegate, context);

              if (context.method === "throw") {
                // If maybeInvokeDelegate(context) changed context.method from
                // "return" to "throw", let that override the TypeError below.
                return ContinueSentinel;
              }
            }

            context.method = "throw";
            context.arg = new TypeError(
              "The iterator does not provide a 'throw' method");
          }

          return ContinueSentinel;
        }

        var record = tryCatch(method, delegate.iterator, context.arg);

        if (record.type === "throw") {
          context.method = "throw";
          context.arg = record.arg;
          context.delegate = null;
          return ContinueSentinel;
        }

        var info = record.arg;

        if (! info) {
          context.method = "throw";
          context.arg = new TypeError("iterator result is not an object");
          context.delegate = null;
          return ContinueSentinel;
        }

        if (info.done) {
          // Assign the result of the finished delegate to the temporary
          // variable specified by delegate.resultName (see delegateYield).
          context[delegate.resultName] = info.value;

          // Resume execution at the desired location (see delegateYield).
          context.next = delegate.nextLoc;

          // If context.method was "throw" but the delegate handled the
          // exception, let the outer generator proceed normally. If
          // context.method was "next", forget context.arg since it has been
          // "consumed" by the delegate iterator. If context.method was
          // "return", allow the original .return call to continue in the
          // outer generator.
          if (context.method !== "return") {
            context.method = "next";
            context.arg = undefined$1;
          }

        } else {
          // Re-yield the result returned by the delegate method.
          return info;
        }

        // The delegate iterator is finished, so forget it and continue with
        // the outer generator.
        context.delegate = null;
        return ContinueSentinel;
      }

      // Define Generator.prototype.{next,throw,return} in terms of the
      // unified ._invoke helper method.
      defineIteratorMethods(Gp);

      Gp[toStringTagSymbol] = "Generator";

      // A Generator should always return itself as the iterator object when the
      // @@iterator function is called on it. Some browsers' implementations of the
      // iterator prototype chain incorrectly implement this, causing the Generator
      // object to not be returned from this call. This ensures that doesn't happen.
      // See https://github.com/facebook/regenerator/issues/274 for more details.
      Gp[iteratorSymbol] = function() {
        return this;
      };

      Gp.toString = function() {
        return "[object Generator]";
      };

      function pushTryEntry(locs) {
        var entry = { tryLoc: locs[0] };

        if (1 in locs) {
          entry.catchLoc = locs[1];
        }

        if (2 in locs) {
          entry.finallyLoc = locs[2];
          entry.afterLoc = locs[3];
        }

        this.tryEntries.push(entry);
      }

      function resetTryEntry(entry) {
        var record = entry.completion || {};
        record.type = "normal";
        delete record.arg;
        entry.completion = record;
      }

      function Context(tryLocsList) {
        // The root entry object (effectively a try statement without a catch
        // or a finally block) gives us a place to store values thrown from
        // locations where there is no enclosing try statement.
        this.tryEntries = [{ tryLoc: "root" }];
        tryLocsList.forEach(pushTryEntry, this);
        this.reset(true);
      }

      exports.keys = function(object) {
        var keys = [];
        for (var key in object) {
          keys.push(key);
        }
        keys.reverse();

        // Rather than returning an object with a next method, we keep
        // things simple and return the next function itself.
        return function next() {
          while (keys.length) {
            var key = keys.pop();
            if (key in object) {
              next.value = key;
              next.done = false;
              return next;
            }
          }

          // To avoid creating an additional object, we just hang the .value
          // and .done properties off the next function object itself. This
          // also ensures that the minifier will not anonymize the function.
          next.done = true;
          return next;
        };
      };

      function values(iterable) {
        if (iterable) {
          var iteratorMethod = iterable[iteratorSymbol];
          if (iteratorMethod) {
            return iteratorMethod.call(iterable);
          }

          if (typeof iterable.next === "function") {
            return iterable;
          }

          if (!isNaN(iterable.length)) {
            var i = -1, next = function next() {
              while (++i < iterable.length) {
                if (hasOwn.call(iterable, i)) {
                  next.value = iterable[i];
                  next.done = false;
                  return next;
                }
              }

              next.value = undefined$1;
              next.done = true;

              return next;
            };

            return next.next = next;
          }
        }

        // Return an iterator with no values.
        return { next: doneResult };
      }
      exports.values = values;

      function doneResult() {
        return { value: undefined$1, done: true };
      }

      Context.prototype = {
        constructor: Context,

        reset: function(skipTempReset) {
          this.prev = 0;
          this.next = 0;
          // Resetting context._sent for legacy support of Babel's
          // function.sent implementation.
          this.sent = this._sent = undefined$1;
          this.done = false;
          this.delegate = null;

          this.method = "next";
          this.arg = undefined$1;

          this.tryEntries.forEach(resetTryEntry);

          if (!skipTempReset) {
            for (var name in this) {
              // Not sure about the optimal order of these conditions:
              if (name.charAt(0) === "t" &&
                  hasOwn.call(this, name) &&
                  !isNaN(+name.slice(1))) {
                this[name] = undefined$1;
              }
            }
          }
        },

        stop: function() {
          this.done = true;

          var rootEntry = this.tryEntries[0];
          var rootRecord = rootEntry.completion;
          if (rootRecord.type === "throw") {
            throw rootRecord.arg;
          }

          return this.rval;
        },

        dispatchException: function(exception) {
          if (this.done) {
            throw exception;
          }

          var context = this;
          function handle(loc, caught) {
            record.type = "throw";
            record.arg = exception;
            context.next = loc;

            if (caught) {
              // If the dispatched exception was caught by a catch block,
              // then let that catch block handle the exception normally.
              context.method = "next";
              context.arg = undefined$1;
            }

            return !! caught;
          }

          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            var record = entry.completion;

            if (entry.tryLoc === "root") {
              // Exception thrown outside of any try block that could handle
              // it, so set the completion value of the entire function to
              // throw the exception.
              return handle("end");
            }

            if (entry.tryLoc <= this.prev) {
              var hasCatch = hasOwn.call(entry, "catchLoc");
              var hasFinally = hasOwn.call(entry, "finallyLoc");

              if (hasCatch && hasFinally) {
                if (this.prev < entry.catchLoc) {
                  return handle(entry.catchLoc, true);
                } else if (this.prev < entry.finallyLoc) {
                  return handle(entry.finallyLoc);
                }

              } else if (hasCatch) {
                if (this.prev < entry.catchLoc) {
                  return handle(entry.catchLoc, true);
                }

              } else if (hasFinally) {
                if (this.prev < entry.finallyLoc) {
                  return handle(entry.finallyLoc);
                }

              } else {
                throw new Error("try statement without catch or finally");
              }
            }
          }
        },

        abrupt: function(type, arg) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            if (entry.tryLoc <= this.prev &&
                hasOwn.call(entry, "finallyLoc") &&
                this.prev < entry.finallyLoc) {
              var finallyEntry = entry;
              break;
            }
          }

          if (finallyEntry &&
              (type === "break" ||
               type === "continue") &&
              finallyEntry.tryLoc <= arg &&
              arg <= finallyEntry.finallyLoc) {
            // Ignore the finally entry if control is not jumping to a
            // location outside the try/catch block.
            finallyEntry = null;
          }

          var record = finallyEntry ? finallyEntry.completion : {};
          record.type = type;
          record.arg = arg;

          if (finallyEntry) {
            this.method = "next";
            this.next = finallyEntry.finallyLoc;
            return ContinueSentinel;
          }

          return this.complete(record);
        },

        complete: function(record, afterLoc) {
          if (record.type === "throw") {
            throw record.arg;
          }

          if (record.type === "break" ||
              record.type === "continue") {
            this.next = record.arg;
          } else if (record.type === "return") {
            this.rval = this.arg = record.arg;
            this.method = "return";
            this.next = "end";
          } else if (record.type === "normal" && afterLoc) {
            this.next = afterLoc;
          }

          return ContinueSentinel;
        },

        finish: function(finallyLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            if (entry.finallyLoc === finallyLoc) {
              this.complete(entry.completion, entry.afterLoc);
              resetTryEntry(entry);
              return ContinueSentinel;
            }
          }
        },

        "catch": function(tryLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            if (entry.tryLoc === tryLoc) {
              var record = entry.completion;
              if (record.type === "throw") {
                var thrown = record.arg;
                resetTryEntry(entry);
              }
              return thrown;
            }
          }

          // The context.catch method must only be called with a location
          // argument that corresponds to a known catch block.
          throw new Error("illegal catch attempt");
        },

        delegateYield: function(iterable, resultName, nextLoc) {
          this.delegate = {
            iterator: values(iterable),
            resultName: resultName,
            nextLoc: nextLoc
          };

          if (this.method === "next") {
            // Deliberately forget the last sent value so that we don't
            // accidentally pass it on to the delegate.
            this.arg = undefined$1;
          }

          return ContinueSentinel;
        }
      };

      // Regardless of whether this script is executing as a CommonJS module
      // or not, return the runtime object so that we can declare the variable
      // regeneratorRuntime in the outer scope, which allows this module to be
      // injected easily by `bin/regenerator --include-runtime script.js`.
      return exports;

    }(
      // If this script is executing as a CommonJS module, use module.exports
      // as the regeneratorRuntime namespace. Otherwise create a new empty
      // object. Either way, the resulting object will be used to initialize
      // the regeneratorRuntime variable at the top of this file.
       module.exports 
    ));

    try {
      regeneratorRuntime = runtime;
    } catch (accidentalStrictMode) {
      // This module should not be running in strict mode, so the above
      // assignment should always work unless something is misconfigured. Just
      // in case runtime.js accidentally runs in strict mode, we can escape
      // strict mode using a global Function call. This could conceivably fail
      // if a Content Security Policy forbids using Function, but in that case
      // the proper solution is to fix the accidental strict mode problem. If
      // you've misconfigured your bundler to force strict mode and applied a
      // CSP to forbid Function, and you're not willing to fix either of those
      // problems, please detail your unique predicament in a GitHub issue.
      Function("r", "regeneratorRuntime = r")(runtime);
    }
    });

    var regenerator = runtime_1;

    var runtime = createCommonjsModule(function (module) {
    /**
     * Copyright (c) 2014-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */

    !(function(global) {

      var Op = Object.prototype;
      var hasOwn = Op.hasOwnProperty;
      var undefined$1; // More compressible than void 0.
      var $Symbol = typeof Symbol === "function" ? Symbol : {};
      var iteratorSymbol = $Symbol.iterator || "@@iterator";
      var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
      var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
      var runtime = global.regeneratorRuntime;
      if (runtime) {
        {
          // If regeneratorRuntime is defined globally and we're in a module,
          // make the exports object identical to regeneratorRuntime.
          module.exports = runtime;
        }
        // Don't bother evaluating the rest of this file if the runtime was
        // already defined globally.
        return;
      }

      // Define the runtime globally (as expected by generated code) as either
      // module.exports (if we're in a module) or a new, empty object.
      runtime = global.regeneratorRuntime =  module.exports ;

      function wrap(innerFn, outerFn, self, tryLocsList) {
        // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
        var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
        var generator = Object.create(protoGenerator.prototype);
        var context = new Context(tryLocsList || []);

        // The ._invoke method unifies the implementations of the .next,
        // .throw, and .return methods.
        generator._invoke = makeInvokeMethod(innerFn, self, context);

        return generator;
      }
      runtime.wrap = wrap;

      // Try/catch helper to minimize deoptimizations. Returns a completion
      // record like context.tryEntries[i].completion. This interface could
      // have been (and was previously) designed to take a closure to be
      // invoked without arguments, but in all the cases we care about we
      // already have an existing method we want to call, so there's no need
      // to create a new function object. We can even get away with assuming
      // the method takes exactly one argument, since that happens to be true
      // in every case, so we don't have to touch the arguments object. The
      // only additional allocation required is the completion record, which
      // has a stable shape and so hopefully should be cheap to allocate.
      function tryCatch(fn, obj, arg) {
        try {
          return { type: "normal", arg: fn.call(obj, arg) };
        } catch (err) {
          return { type: "throw", arg: err };
        }
      }

      var GenStateSuspendedStart = "suspendedStart";
      var GenStateSuspendedYield = "suspendedYield";
      var GenStateExecuting = "executing";
      var GenStateCompleted = "completed";

      // Returning this object from the innerFn has the same effect as
      // breaking out of the dispatch switch statement.
      var ContinueSentinel = {};

      // Dummy constructor functions that we use as the .constructor and
      // .constructor.prototype properties for functions that return Generator
      // objects. For full spec compliance, you may wish to configure your
      // minifier not to mangle the names of these two functions.
      function Generator() {}
      function GeneratorFunction() {}
      function GeneratorFunctionPrototype() {}

      // This is a polyfill for %IteratorPrototype% for environments that
      // don't natively support it.
      var IteratorPrototype = {};
      IteratorPrototype[iteratorSymbol] = function () {
        return this;
      };

      var getProto = Object.getPrototypeOf;
      var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
      if (NativeIteratorPrototype &&
          NativeIteratorPrototype !== Op &&
          hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
        // This environment has a native %IteratorPrototype%; use it instead
        // of the polyfill.
        IteratorPrototype = NativeIteratorPrototype;
      }

      var Gp = GeneratorFunctionPrototype.prototype =
        Generator.prototype = Object.create(IteratorPrototype);
      GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
      GeneratorFunctionPrototype.constructor = GeneratorFunction;
      GeneratorFunctionPrototype[toStringTagSymbol] =
        GeneratorFunction.displayName = "GeneratorFunction";

      // Helper for defining the .next, .throw, and .return methods of the
      // Iterator interface in terms of a single ._invoke method.
      function defineIteratorMethods(prototype) {
        ["next", "throw", "return"].forEach(function(method) {
          prototype[method] = function(arg) {
            return this._invoke(method, arg);
          };
        });
      }

      runtime.isGeneratorFunction = function(genFun) {
        var ctor = typeof genFun === "function" && genFun.constructor;
        return ctor
          ? ctor === GeneratorFunction ||
            // For the native GeneratorFunction constructor, the best we can
            // do is to check its .name property.
            (ctor.displayName || ctor.name) === "GeneratorFunction"
          : false;
      };

      runtime.mark = function(genFun) {
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
        } else {
          genFun.__proto__ = GeneratorFunctionPrototype;
          if (!(toStringTagSymbol in genFun)) {
            genFun[toStringTagSymbol] = "GeneratorFunction";
          }
        }
        genFun.prototype = Object.create(Gp);
        return genFun;
      };

      // Within the body of any async function, `await x` is transformed to
      // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
      // `hasOwn.call(value, "__await")` to determine if the yielded value is
      // meant to be awaited.
      runtime.awrap = function(arg) {
        return { __await: arg };
      };

      function AsyncIterator(generator) {
        function invoke(method, arg, resolve, reject) {
          var record = tryCatch(generator[method], generator, arg);
          if (record.type === "throw") {
            reject(record.arg);
          } else {
            var result = record.arg;
            var value = result.value;
            if (value &&
                typeof value === "object" &&
                hasOwn.call(value, "__await")) {
              return Promise.resolve(value.__await).then(function(value) {
                invoke("next", value, resolve, reject);
              }, function(err) {
                invoke("throw", err, resolve, reject);
              });
            }

            return Promise.resolve(value).then(function(unwrapped) {
              // When a yielded Promise is resolved, its final value becomes
              // the .value of the Promise<{value,done}> result for the
              // current iteration. If the Promise is rejected, however, the
              // result for this iteration will be rejected with the same
              // reason. Note that rejections of yielded Promises are not
              // thrown back into the generator function, as is the case
              // when an awaited Promise is rejected. This difference in
              // behavior between yield and await is important, because it
              // allows the consumer to decide what to do with the yielded
              // rejection (swallow it and continue, manually .throw it back
              // into the generator, abandon iteration, whatever). With
              // await, by contrast, there is no opportunity to examine the
              // rejection reason outside the generator function, so the
              // only option is to throw it from the await expression, and
              // let the generator function handle the exception.
              result.value = unwrapped;
              resolve(result);
            }, reject);
          }
        }

        var previousPromise;

        function enqueue(method, arg) {
          function callInvokeWithMethodAndArg() {
            return new Promise(function(resolve, reject) {
              invoke(method, arg, resolve, reject);
            });
          }

          return previousPromise =
            // If enqueue has been called before, then we want to wait until
            // all previous Promises have been resolved before calling invoke,
            // so that results are always delivered in the correct order. If
            // enqueue has not been called before, then it is important to
            // call invoke immediately, without waiting on a callback to fire,
            // so that the async generator function has the opportunity to do
            // any necessary setup in a predictable way. This predictability
            // is why the Promise constructor synchronously invokes its
            // executor callback, and why async functions synchronously
            // execute code before the first await. Since we implement simple
            // async functions in terms of async generators, it is especially
            // important to get this right, even though it requires care.
            previousPromise ? previousPromise.then(
              callInvokeWithMethodAndArg,
              // Avoid propagating failures to Promises returned by later
              // invocations of the iterator.
              callInvokeWithMethodAndArg
            ) : callInvokeWithMethodAndArg();
        }

        // Define the unified helper method that is used to implement .next,
        // .throw, and .return (see defineIteratorMethods).
        this._invoke = enqueue;
      }

      defineIteratorMethods(AsyncIterator.prototype);
      AsyncIterator.prototype[asyncIteratorSymbol] = function () {
        return this;
      };
      runtime.AsyncIterator = AsyncIterator;

      // Note that simple async functions are implemented on top of
      // AsyncIterator objects; they just return a Promise for the value of
      // the final result produced by the iterator.
      runtime.async = function(innerFn, outerFn, self, tryLocsList) {
        var iter = new AsyncIterator(
          wrap(innerFn, outerFn, self, tryLocsList)
        );

        return runtime.isGeneratorFunction(outerFn)
          ? iter // If outerFn is a generator, return the full iterator.
          : iter.next().then(function(result) {
              return result.done ? result.value : iter.next();
            });
      };

      function makeInvokeMethod(innerFn, self, context) {
        var state = GenStateSuspendedStart;

        return function invoke(method, arg) {
          if (state === GenStateExecuting) {
            throw new Error("Generator is already running");
          }

          if (state === GenStateCompleted) {
            if (method === "throw") {
              throw arg;
            }

            // Be forgiving, per 25.3.3.3.3 of the spec:
            // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
            return doneResult();
          }

          context.method = method;
          context.arg = arg;

          while (true) {
            var delegate = context.delegate;
            if (delegate) {
              var delegateResult = maybeInvokeDelegate(delegate, context);
              if (delegateResult) {
                if (delegateResult === ContinueSentinel) continue;
                return delegateResult;
              }
            }

            if (context.method === "next") {
              // Setting context._sent for legacy support of Babel's
              // function.sent implementation.
              context.sent = context._sent = context.arg;

            } else if (context.method === "throw") {
              if (state === GenStateSuspendedStart) {
                state = GenStateCompleted;
                throw context.arg;
              }

              context.dispatchException(context.arg);

            } else if (context.method === "return") {
              context.abrupt("return", context.arg);
            }

            state = GenStateExecuting;

            var record = tryCatch(innerFn, self, context);
            if (record.type === "normal") {
              // If an exception is thrown from innerFn, we leave state ===
              // GenStateExecuting and loop back for another invocation.
              state = context.done
                ? GenStateCompleted
                : GenStateSuspendedYield;

              if (record.arg === ContinueSentinel) {
                continue;
              }

              return {
                value: record.arg,
                done: context.done
              };

            } else if (record.type === "throw") {
              state = GenStateCompleted;
              // Dispatch the exception by looping back around to the
              // context.dispatchException(context.arg) call above.
              context.method = "throw";
              context.arg = record.arg;
            }
          }
        };
      }

      // Call delegate.iterator[context.method](context.arg) and handle the
      // result, either by returning a { value, done } result from the
      // delegate iterator, or by modifying context.method and context.arg,
      // setting context.delegate to null, and returning the ContinueSentinel.
      function maybeInvokeDelegate(delegate, context) {
        var method = delegate.iterator[context.method];
        if (method === undefined$1) {
          // A .throw or .return when the delegate iterator has no .throw
          // method always terminates the yield* loop.
          context.delegate = null;

          if (context.method === "throw") {
            if (delegate.iterator.return) {
              // If the delegate iterator has a return method, give it a
              // chance to clean up.
              context.method = "return";
              context.arg = undefined$1;
              maybeInvokeDelegate(delegate, context);

              if (context.method === "throw") {
                // If maybeInvokeDelegate(context) changed context.method from
                // "return" to "throw", let that override the TypeError below.
                return ContinueSentinel;
              }
            }

            context.method = "throw";
            context.arg = new TypeError(
              "The iterator does not provide a 'throw' method");
          }

          return ContinueSentinel;
        }

        var record = tryCatch(method, delegate.iterator, context.arg);

        if (record.type === "throw") {
          context.method = "throw";
          context.arg = record.arg;
          context.delegate = null;
          return ContinueSentinel;
        }

        var info = record.arg;

        if (! info) {
          context.method = "throw";
          context.arg = new TypeError("iterator result is not an object");
          context.delegate = null;
          return ContinueSentinel;
        }

        if (info.done) {
          // Assign the result of the finished delegate to the temporary
          // variable specified by delegate.resultName (see delegateYield).
          context[delegate.resultName] = info.value;

          // Resume execution at the desired location (see delegateYield).
          context.next = delegate.nextLoc;

          // If context.method was "throw" but the delegate handled the
          // exception, let the outer generator proceed normally. If
          // context.method was "next", forget context.arg since it has been
          // "consumed" by the delegate iterator. If context.method was
          // "return", allow the original .return call to continue in the
          // outer generator.
          if (context.method !== "return") {
            context.method = "next";
            context.arg = undefined$1;
          }

        } else {
          // Re-yield the result returned by the delegate method.
          return info;
        }

        // The delegate iterator is finished, so forget it and continue with
        // the outer generator.
        context.delegate = null;
        return ContinueSentinel;
      }

      // Define Generator.prototype.{next,throw,return} in terms of the
      // unified ._invoke helper method.
      defineIteratorMethods(Gp);

      Gp[toStringTagSymbol] = "Generator";

      // A Generator should always return itself as the iterator object when the
      // @@iterator function is called on it. Some browsers' implementations of the
      // iterator prototype chain incorrectly implement this, causing the Generator
      // object to not be returned from this call. This ensures that doesn't happen.
      // See https://github.com/facebook/regenerator/issues/274 for more details.
      Gp[iteratorSymbol] = function() {
        return this;
      };

      Gp.toString = function() {
        return "[object Generator]";
      };

      function pushTryEntry(locs) {
        var entry = { tryLoc: locs[0] };

        if (1 in locs) {
          entry.catchLoc = locs[1];
        }

        if (2 in locs) {
          entry.finallyLoc = locs[2];
          entry.afterLoc = locs[3];
        }

        this.tryEntries.push(entry);
      }

      function resetTryEntry(entry) {
        var record = entry.completion || {};
        record.type = "normal";
        delete record.arg;
        entry.completion = record;
      }

      function Context(tryLocsList) {
        // The root entry object (effectively a try statement without a catch
        // or a finally block) gives us a place to store values thrown from
        // locations where there is no enclosing try statement.
        this.tryEntries = [{ tryLoc: "root" }];
        tryLocsList.forEach(pushTryEntry, this);
        this.reset(true);
      }

      runtime.keys = function(object) {
        var keys = [];
        for (var key in object) {
          keys.push(key);
        }
        keys.reverse();

        // Rather than returning an object with a next method, we keep
        // things simple and return the next function itself.
        return function next() {
          while (keys.length) {
            var key = keys.pop();
            if (key in object) {
              next.value = key;
              next.done = false;
              return next;
            }
          }

          // To avoid creating an additional object, we just hang the .value
          // and .done properties off the next function object itself. This
          // also ensures that the minifier will not anonymize the function.
          next.done = true;
          return next;
        };
      };

      function values(iterable) {
        if (iterable) {
          var iteratorMethod = iterable[iteratorSymbol];
          if (iteratorMethod) {
            return iteratorMethod.call(iterable);
          }

          if (typeof iterable.next === "function") {
            return iterable;
          }

          if (!isNaN(iterable.length)) {
            var i = -1, next = function next() {
              while (++i < iterable.length) {
                if (hasOwn.call(iterable, i)) {
                  next.value = iterable[i];
                  next.done = false;
                  return next;
                }
              }

              next.value = undefined$1;
              next.done = true;

              return next;
            };

            return next.next = next;
          }
        }

        // Return an iterator with no values.
        return { next: doneResult };
      }
      runtime.values = values;

      function doneResult() {
        return { value: undefined$1, done: true };
      }

      Context.prototype = {
        constructor: Context,

        reset: function(skipTempReset) {
          this.prev = 0;
          this.next = 0;
          // Resetting context._sent for legacy support of Babel's
          // function.sent implementation.
          this.sent = this._sent = undefined$1;
          this.done = false;
          this.delegate = null;

          this.method = "next";
          this.arg = undefined$1;

          this.tryEntries.forEach(resetTryEntry);

          if (!skipTempReset) {
            for (var name in this) {
              // Not sure about the optimal order of these conditions:
              if (name.charAt(0) === "t" &&
                  hasOwn.call(this, name) &&
                  !isNaN(+name.slice(1))) {
                this[name] = undefined$1;
              }
            }
          }
        },

        stop: function() {
          this.done = true;

          var rootEntry = this.tryEntries[0];
          var rootRecord = rootEntry.completion;
          if (rootRecord.type === "throw") {
            throw rootRecord.arg;
          }

          return this.rval;
        },

        dispatchException: function(exception) {
          if (this.done) {
            throw exception;
          }

          var context = this;
          function handle(loc, caught) {
            record.type = "throw";
            record.arg = exception;
            context.next = loc;

            if (caught) {
              // If the dispatched exception was caught by a catch block,
              // then let that catch block handle the exception normally.
              context.method = "next";
              context.arg = undefined$1;
            }

            return !! caught;
          }

          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            var record = entry.completion;

            if (entry.tryLoc === "root") {
              // Exception thrown outside of any try block that could handle
              // it, so set the completion value of the entire function to
              // throw the exception.
              return handle("end");
            }

            if (entry.tryLoc <= this.prev) {
              var hasCatch = hasOwn.call(entry, "catchLoc");
              var hasFinally = hasOwn.call(entry, "finallyLoc");

              if (hasCatch && hasFinally) {
                if (this.prev < entry.catchLoc) {
                  return handle(entry.catchLoc, true);
                } else if (this.prev < entry.finallyLoc) {
                  return handle(entry.finallyLoc);
                }

              } else if (hasCatch) {
                if (this.prev < entry.catchLoc) {
                  return handle(entry.catchLoc, true);
                }

              } else if (hasFinally) {
                if (this.prev < entry.finallyLoc) {
                  return handle(entry.finallyLoc);
                }

              } else {
                throw new Error("try statement without catch or finally");
              }
            }
          }
        },

        abrupt: function(type, arg) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            if (entry.tryLoc <= this.prev &&
                hasOwn.call(entry, "finallyLoc") &&
                this.prev < entry.finallyLoc) {
              var finallyEntry = entry;
              break;
            }
          }

          if (finallyEntry &&
              (type === "break" ||
               type === "continue") &&
              finallyEntry.tryLoc <= arg &&
              arg <= finallyEntry.finallyLoc) {
            // Ignore the finally entry if control is not jumping to a
            // location outside the try/catch block.
            finallyEntry = null;
          }

          var record = finallyEntry ? finallyEntry.completion : {};
          record.type = type;
          record.arg = arg;

          if (finallyEntry) {
            this.method = "next";
            this.next = finallyEntry.finallyLoc;
            return ContinueSentinel;
          }

          return this.complete(record);
        },

        complete: function(record, afterLoc) {
          if (record.type === "throw") {
            throw record.arg;
          }

          if (record.type === "break" ||
              record.type === "continue") {
            this.next = record.arg;
          } else if (record.type === "return") {
            this.rval = this.arg = record.arg;
            this.method = "return";
            this.next = "end";
          } else if (record.type === "normal" && afterLoc) {
            this.next = afterLoc;
          }

          return ContinueSentinel;
        },

        finish: function(finallyLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            if (entry.finallyLoc === finallyLoc) {
              this.complete(entry.completion, entry.afterLoc);
              resetTryEntry(entry);
              return ContinueSentinel;
            }
          }
        },

        "catch": function(tryLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            if (entry.tryLoc === tryLoc) {
              var record = entry.completion;
              if (record.type === "throw") {
                var thrown = record.arg;
                resetTryEntry(entry);
              }
              return thrown;
            }
          }

          // The context.catch method must only be called with a location
          // argument that corresponds to a known catch block.
          throw new Error("illegal catch attempt");
        },

        delegateYield: function(iterable, resultName, nextLoc) {
          this.delegate = {
            iterator: values(iterable),
            resultName: resultName,
            nextLoc: nextLoc
          };

          if (this.method === "next") {
            // Deliberately forget the last sent value so that we don't
            // accidentally pass it on to the delegate.
            this.arg = undefined$1;
          }

          return ContinueSentinel;
        }
      };
    })(
      // In sloppy mode, unbound `this` refers to the global object, fallback to
      // Function constructor if we're in global strict mode. That is sadly a form
      // of indirect eval which violates Content Security Policy.
      (function() { return this })() || Function("return this")()
    );
    });

    function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
      try {
        var info = gen[key](arg);
        var value = info.value;
      } catch (error) {
        reject(error);
        return;
      }

      if (info.done) {
        resolve(value);
      } else {
        Promise.resolve(value).then(_next, _throw);
      }
    }

    function _asyncToGenerator(fn) {
      return function () {
        var self = this,
            args = arguments;
        return new Promise(function (resolve, reject) {
          var gen = fn.apply(self, args);

          function _next(value) {
            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
          }

          function _throw(err) {
            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
          }

          _next(undefined);
        });
      };
    }

    var asyncToGenerator = _asyncToGenerator;

    var Common = /*#__PURE__*/function () {
      function Common() {
        classCallCheck(this, Common);
      }

      createClass(Common, null, [{
        key: "isError",
        value: function isError(e) {
          return e instanceof Error;
        }
      }]);

      return Common;
    }();

    defineProperty(Common, "DEFAULT_REDIRECT_TIMEOUT", 5000);

    defineProperty(Common, "CLASS_OK", 'is-success');

    defineProperty(Common, "CLASS_ERR", 'is-danger');

    function _createSuper$3(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$3(); return function _createSuperInternal() { var Super = getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return possibleConstructorReturn(this, result); }; }

    function _isNativeReflectConstruct$3() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

    /* global notFramework */
    var ERROR_DEFAULT = 'Что пошло не так.';
    var BREADCRUMBS = [];

    var ncCRUD = /*#__PURE__*/function (_notFramework$notCont) {
      inherits(ncCRUD, _notFramework$notCont);

      var _super = _createSuper$3(ncCRUD);

      function ncCRUD(app, params) {
        var _this;

        classCallCheck(this, ncCRUD);

        _this = _super.call(this, app);

        _this.log('CRUD Controller');

        _this.ui = {};
        _this.els = {};

        _this.setOptions('names', {
          plural: 'plural',
          single: 'single'
        });

        _this.setOptions('containerSelector', _this.app.getOptions('crud.containerSelector'));

        _this.setOptions('params', params);

        _this.buildFrame();

        return possibleConstructorReturn(_this, assertThisInitialized(_this));
      }

      createClass(ncCRUD, [{
        key: "start",
        value: function start() {
          var _this2 = this;

          BREADCRUMBS.splice(0, BREADCRUMBS.length, {
            title: this.getOptions('names.plural'),
            url: this.getModelURL()
          });
          Breadcrumbs.setHead(BREADCRUMBS).render({
            root: this.app.getOptions('router:root'),
            target: this.els.top,
            navigate: function navigate(url) {
              return _this2.app.getWorking('router').navigate(url);
            }
          });
          this.preloadVariants();
          this.route(this.getOptions('params'));
        }
      }, {
        key: "getModel",
        value: function getModel() {
          return this.make[this.getModuleName()];
        }
      }, {
        key: "setBreadcrumbs",
        value: function setBreadcrumbs(tail) {
          Breadcrumbs.setTail(tail).update();
        }
      }, {
        key: "backToList",
        value: function backToList() {
          this.app.getWorking('router').navigate(this.linkBackToList());
        }
      }, {
        key: "afterAction",
        value: function afterAction() {
          var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'list';
          var navBack = this.app.getOptions('crud.navigateBackAfter', []);

          if (navBack && Array.isArray(navBack) && navBack.indexOf(action) > -1) {
            window.history.back();
          } else {
            this.backToList();
          }
        }
      }, {
        key: "linkBackToList",
        value: function linkBackToList() {
          return this.getModelURL();
        }
      }, {
        key: "buildFrame",
        value: function buildFrame() {
          var el = document.querySelector(this.app.getOptions('crud.containerSelector', 'body'));

          while (el.firstChild) {
            el.removeChild(el.firstChild);
          }

          this.els.top = document.createElement('div');
          this.els.top.id = 'crud-top';
          this.els.top.classList.add('box');
          el.appendChild(this.els.top);
          this.els.main = document.createElement('div');
          this.els.main.id = 'crud-main';
          this.els.main.classList.add('box');
          el.appendChild(this.els.main);
          this.els.bottom = document.createElement('div');
          this.els.bottom.id = 'crud-bottom';
          this.els.bottom.classList.add('box');
          el.appendChild(this.els.bottom);
        }
      }, {
        key: "preloadVariants",
        value: function () {
          var _preloadVariants = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
            var _this3 = this;

            var type,
                preload,
                libProps,
                proms,
                results,
                i,
                _args = arguments;
            return regenerator.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    type = _args.length > 0 && _args[0] !== undefined ? _args[0] : 'list';
                    _context.prev = 1;

                    if (!(['create', 'update', 'list', 'delete', 'details'].indexOf(type) === -1)) {
                      _context.next = 4;
                      break;
                    }

                    return _context.abrupt("return");

                  case 4:
                    preload = this.getOptions("".concat(type, ".preload"), {});

                    if (Object.keys(preload).length == 0) {
                      preload = this.getOptions("preload", {});
                    }

                    if (!(Object.keys(preload).length > 0)) {
                      _context.next = 14;
                      break;
                    }

                    libProps = Object.keys(preload);
                    proms = [];
                    libProps.forEach(function (prop) {
                      var modelName = notFramework.notCommon.lowerFirstLetter(preload[prop]);

                      var Model = _this3.make[modelName]({});

                      proms.push(Model.$listAll());
                    });
                    _context.next = 12;
                    return Promise.all(proms);

                  case 12:
                    results = _context.sent;

                    for (i = 0; i < libProps.length; i++) {
                      if (Array.isArray(results[i])) {
                        Form$1.addVariants(libProps[i], results[i].map(function (item) {
                          return {
                            id: item._id,
                            title: item.title
                          };
                        }));
                      }
                    }

                  case 14:
                    this.log('preload finished');
                    _context.next = 20;
                    break;

                  case 17:
                    _context.prev = 17;
                    _context.t0 = _context["catch"](1);
                    this.error(_context.t0);

                  case 20:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee, this, [[1, 17]]);
          }));

          function preloadVariants() {
            return _preloadVariants.apply(this, arguments);
          }

          return preloadVariants;
        }()
      }, {
        key: "getTitleFromLib",
        value: function getTitleFromLib(propName, id) {
          return Form$1.getVariantTitle(propName, id);
        }
      }, {
        key: "createDefault",
        value: function createDefault() {
          var newRecord = this.getModel()({
            '_id': null,
            title: this.getOptions('names.single'),
            products: []
          });
          return newRecord;
        }
      }, {
        key: "route",
        value: function route() {
          var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

          if (params.length == 1) {
            if (params[0] === 'create') {
              return this.runCreate(params);
            } else {
              return this.runDetails(params);
            }
          } else if (params.length == 2) {
            if (params[1] === 'delete') {
              return this.runDelete(params);
            } else if (params[1] === 'update') {
              return this.runUpdate(params);
            } else {
              var routeRunnerName = 'run' + notFramework.notCommon.capitalizeFirstLetter(params[1]);

              if (this[routeRunnerName] && typeof this[routeRunnerName] === 'function') {
                return this[routeRunnerName](params);
              }
            }
          }

          return this.runList(params);
        }
      }, {
        key: "runCreate",
        value: function () {
          var _runCreate = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2() {
            var _this4 = this;

            var manifest;
            return regenerator.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    _context2.next = 2;
                    return this.preloadVariants('create');

                  case 2:
                    this.setBreadcrumbs([{
                      title: 'Добавление',
                      url: '/' + this.getModuleName() + '/create'
                    }]);

                    if (!this.ui.create) {
                      _context2.next = 7;
                      break;
                    }

                    return _context2.abrupt("return");

                  case 7:
                    this.$destroyUI();

                  case 8:
                    manifest = this.app.getInterfaceManifest()[this.getModuleName()];
                    this.ui.create = Form$1.build({
                      target: this.els.main,
                      manifest: manifest,
                      action: 'create',
                      options: {},
                      validators: this.getOptions('Validators'),
                      data: this.createDefault()
                    });
                    this.ui.create.$on('submit', function (ev) {
                      return _this4.onCreateFormSubmit(ev.detail);
                    });
                    this.ui.create.$on('reject', this.goList.bind(this));

                  case 12:
                  case "end":
                    return _context2.stop();
                }
              }
            }, _callee2, this);
          }));

          function runCreate() {
            return _runCreate.apply(this, arguments);
          }

          return runCreate;
        }()
      }, {
        key: "runDetails",
        value: function () {
          var _runDetails = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee3(params) {
            var _this5 = this;

            var manifest;
            return regenerator.wrap(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    _context3.next = 2;
                    return this.preloadVariants('details');

                  case 2:
                    this.setBreadcrumbs([{
                      title: 'Просмотр',
                      url: '/' + this.getModuleName() + "/".concat(params[0])
                    }]);

                    if (!this.ui.details) {
                      _context3.next = 7;
                      break;
                    }

                    return _context3.abrupt("return");

                  case 7:
                    this.$destroyUI();

                  case 8:
                    manifest = this.app.getInterfaceManifest()[this.getModuleName()];
                    this.getModel()({
                      _id: params[0]
                    }).$get().then(function (res) {
                      if (res.status === 'ok') {
                        _this5.ui.details = Form$1.build({
                          target: _this5.els.main,
                          manifest: manifest,
                          action: 'get',
                          options: {
                            readonly: true
                          },
                          validators: _this5.getOptions('Validators'),
                          data: notFramework.notCommon.stripProxy(res.result)
                        });
                      } else {
                        _this5.error(res);

                        _this5.ui.error = new Ui_error({
                          target: _this5.els.main,
                          props: {
                            title: 'Произошла ошибка',
                            message: res.error ? res.error : ERROR_DEFAULT
                          }
                        });
                      }
                    }).catch(this.error.bind(this));

                  case 10:
                  case "end":
                    return _context3.stop();
                }
              }
            }, _callee3, this);
          }));

          function runDetails(_x) {
            return _runDetails.apply(this, arguments);
          }

          return runDetails;
        }()
      }, {
        key: "runUpdate",
        value: function () {
          var _runUpdate = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee4(params) {
            var _this6 = this;

            var manifest;
            return regenerator.wrap(function _callee4$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    _context4.next = 2;
                    return this.preloadVariants('update');

                  case 2:
                    this.setBreadcrumbs([{
                      title: 'Редактирование',
                      url: '/' + this.getModuleName() + "/".concat(params[0], "/update")
                    }]);

                    if (!this.ui.update) {
                      _context4.next = 7;
                      break;
                    }

                    return _context4.abrupt("return");

                  case 7:
                    this.$destroyUI();

                  case 8:
                    manifest = this.app.getInterfaceManifest()[this.getModuleName()];
                    this.getModel()({
                      _id: params[0]
                    }).$getRaw().then(function (res) {
                      if (res.status === 'ok') {
                        _this6.setBreadcrumbs([{
                          title: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \"".concat(res.result.title, "\""),
                          url: '/' + _this6.getModuleName() + "/".concat(params[0], "/update")
                        }]);

                        _this6.ui.update = Form$1.build({
                          target: _this6.els.main,
                          manifest: manifest,
                          action: 'update',
                          options: {},
                          validators: _this6.getOptions('Validators'),
                          data: notFramework.notCommon.stripProxy(res.result)
                        });

                        _this6.ui.update.$on('submit', function (ev) {
                          _this6.onUpdateFormSubmit(ev.detail);
                        });

                        _this6.ui.update.$on('reject', _this6.goList.bind(_this6));
                      } else {
                        _this6.ui.error = new Ui_error({
                          target: _this6.els.main,
                          props: {
                            title: 'Произошла ошибка',
                            message: res.error ? res.error : ERROR_DEFAULT
                          }
                        });
                      }
                    }).catch(this.error.bind(this));

                  case 10:
                  case "end":
                    return _context4.stop();
                }
              }
            }, _callee4, this);
          }));

          function runUpdate(_x2) {
            return _runUpdate.apply(this, arguments);
          }

          return runUpdate;
        }()
      }, {
        key: "runDelete",
        value: function () {
          var _runDelete = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee5(params) {
            var _this7 = this;

            return regenerator.wrap(function _callee5$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    _context5.next = 2;
                    return this.preloadVariants('delete');

                  case 2:
                    this.setBreadcrumbs([{
                      title: 'Удаление',
                      url: '/' + this.getModuleName() + "/".concat(params[0], "/delete")
                    }]);

                    if (confirm('Удалить запись?')) {
                      this.getModel()({
                        _id: params[0]
                      }).$delete().then(function () {
                        _this7.goList();
                      }).catch(function (e) {
                        _this7.error(e);

                        _this7.goList();
                      });
                    } else {
                      this.goList();
                    }

                  case 4:
                  case "end":
                    return _context5.stop();
                }
              }
            }, _callee5, this);
          }));

          function runDelete(_x3) {
            return _runDelete.apply(this, arguments);
          }

          return runDelete;
        }()
      }, {
        key: "runList",
        value: function () {
          var _runList = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee6() {
            return regenerator.wrap(function _callee6$(_context6) {
              while (1) {
                switch (_context6.prev = _context6.next) {
                  case 0:
                    _context6.next = 2;
                    return this.preloadVariants('list');

                  case 2:
                    this.setBreadcrumbs([{
                      title: 'Список',
                      url: "/" + this.getModuleName()
                    }]);

                    if (!this.ui.list) {
                      _context6.next = 7;
                      break;
                    }

                    return _context6.abrupt("return");

                  case 7:
                    this.$destroyUI();

                  case 8:
                    this.ui.list = new notTable({
                      options: {
                        targetEl: this.els.main,
                        interface: {
                          combined: true,
                          factory: this.getModel()
                        },
                        endless: false,
                        preload: {},
                        pager: {
                          size: 50,
                          page: 0
                        },
                        sorter: {
                          id: -1
                        },
                        actions: [{
                          title: 'Создать',
                          action: this.goCreate.bind(this)
                        }],
                        fields: this.getOptions('list.fields')
                      }
                    });

                  case 9:
                  case "end":
                    return _context6.stop();
                }
              }
            }, _callee6, this);
          }));

          function runList() {
            return _runList.apply(this, arguments);
          }

          return runList;
        }()
      }, {
        key: "goCreate",
        value: function goCreate() {
          this.app.getWorking('router').navigate('/' + [this.getModelURL(), 'create'].join('/'));
        }
      }, {
        key: "goDetails",
        value: function goDetails(value) {
          this.app.getWorking('router').navigate('/' + [this.getModelURL(), value].join('/'));
        }
      }, {
        key: "goUpdate",
        value: function goUpdate(value) {
          this.app.getWorking('router').navigate('/' + [this.getModelURL(), value, 'update'].join('/'));
        }
      }, {
        key: "goDelete",
        value: function goDelete(value) {
          this.app.getWorking('router').navigate('/' + [this.getModelURL(), value, 'delete'].join('/'));
        }
      }, {
        key: "goList",
        value: function goList() {
          this.app.getWorking('router').navigate('/' + this.getModelURL());
        }
      }, {
        key: "onCreateFormSubmit",
        value: function onCreateFormSubmit(item) {
          var _this8 = this;

          this.ui.create.setLoading();
          this.getModel()(item).$create().then(function (res) {
            _this8.log(res);

            _this8.showResult(_this8.ui.create, res);

            if (!Common.isError(res) && !res.error) {
              setTimeout(function () {
                return _this8.goList(_this8.app);
              }, 3000);
            }
          }).catch(function (e) {
            _this8.showResult(_this8.ui.create, e);
          });
        }
      }, {
        key: "onUpdateFormSubmit",
        value: function onUpdateFormSubmit(item) {
          var _this9 = this;

          this.ui.update.setLoading();
          this.getModel()(item).$update().then(function (res) {
            _this9.showResult(_this9.ui.update, res);

            if (!Common.isError(res) && !res.error) {
              setTimeout(function () {
                return _this9.goList(_this9.app);
              }, 3000);
            }
          }).catch(function (e) {
            _this9.showResult(_this9.ui.update, e);
          });
        }
      }, {
        key: "showResult",
        value: function showResult(ui, res) {
          ui.resetLoading();

          if (Common.isError(res)) {
            notFramework.notCommon.report(res);
          } else {
            if (res.errors && Object.keys(res.errors).length > 0) {
              if (!Array.isArray(res.error)) {
                res.error = [];
              }

              Object.keys(res.errors).forEach(function (fieldName) {
                var _res$error;

                ui.setFieldInvalid(fieldName, res.errors[fieldName]);

                (_res$error = res.error).push.apply(_res$error, toConsumableArray(res.errors[fieldName]));
              });
            }

            if (res.error) {
              ui.setFormError(res.error);
            }

            if (!res.error) {
              ui.showSuccess();
            }
          }
        }
      }, {
        key: "$destroyUI",
        value: function $destroyUI() {
          for (var name in this.ui) {
            this.ui[name].$destroy && this.ui[name].$destroy();
            delete this.ui[name];
          }
        }
      }]);

      return ncCRUD;
    }(notFramework.notController);

    Object.keys(FormElements).forEach(function (fieldtype) {
      Form$1.addComponent(fieldtype, FormElements[fieldtype]);
    });

    exports.Breadcrumbs = Breadcrumbs;
    exports.Common = Common;
    exports.Form = Form$1;
    exports.FormElements = FormElements;
    exports.Menu = Menu;
    exports.SideMenu = SideMenu;
    exports.Table = notTable;
    exports.TableStores = notTable_stores;
    exports.TopMenu = TopMenu;
    exports.UIBooleans = Ui_booleans;
    exports.UIBreadcrumbs = Ui_breadcrumbs;
    exports.UIButton = Ui_button;
    exports.UIButtons = Ui_buttons;
    exports.UIError = Ui_error;
    exports.UIImages = Ui_images;
    exports.UILinks = Ui_links;
    exports.UISideMenu = Ui_side_menu;
    exports.UITag = Ui_tag;
    exports.ncCRUD = ncCRUD;

    return exports;

}({}));
