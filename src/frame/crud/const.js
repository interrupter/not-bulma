const DEFAULT_TRASFORMER = (res) => {
    // @ts-ignore
    return Object.hasOwn(res, "status") && Object.hasOwn(res, "result")
        ? res.result
        : res;
};

export { DEFAULT_TRASFORMER };
