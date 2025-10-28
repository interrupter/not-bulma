#!/bin/bash
echo 'building examples html'
SRC_ROOT=./examples/src/tmpl/pages/
DIST_ROOT=./examples/dist/docs/
EMPTY=""
DIRS=$(find $SRC_ROOT -maxdepth 5 -type d)
#for DIR in $DIRS; 
#    do 
#        sub_dir=$(echo "${DIR/$SRC_ROOT/$EMPTY}")
#        if [ $sub_dir = "" ]; then 
#           continue
#        fi        
#        dist_dir=$DIST_ROOT$sub_dir        
#        if [ ! -d $dist_dir ]; then
#            echo "creating destination dir $dist_dir"
#            mkdir -p $dist_dir
#        fi        
#    done;
./node_modules/.bin/pug $SRC_ROOT --out $DIST_ROOT
exit 0;
