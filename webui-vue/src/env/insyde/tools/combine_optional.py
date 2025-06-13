#!/usr/bin/env python3

import sys, os, shutil, getopt
from merge import json_merge, file_merge, remove_duplicate_pattern

def walklevel(some_dir, level=1):
    some_dir = some_dir.rstrip(os.path.sep)
    assert os.path.isdir(some_dir)
    num_sep = some_dir.count(os.path.sep)
    for root, dirs, files in os.walk(some_dir):
        yield root, dirs, files
        num_sep_this = root.count(os.path.sep)
        if num_sep + level <= num_sep_this:
            del dirs[:]

# optional_dir is the path of SPF5X/web/optional
def add_optional_features(optional_dir):
    vue_src = os.path.abspath(os.path.dirname(__file__) + "/../../../..")
    print("NOTE: OPTIONAL_DIR: %s" % optional_dir)
    srcdir = vue_src
    print("NOTE: srcdir = %s" % srcdir)
    outdir = vue_src
    print("NOTE: outdir = %s" % outdir)

    if not os.path.isdir(optional_dir):
        print("Error, {} is not a directory".format(optional_dir))
        return
    if not os.path.isdir(srcdir):
        print("Error, {} is not a directory".format(srcdir))
        return
    if not os.path.isdir(outdir):
        print("Error, {} is not a directory".format(outdir))
        return

    print("\nWarning this will override your source code, make sure you have a backup.")
    if not assumeYes:
        yn = input("Please input 'yes' to start: ")
        if yn != 'yes':
            print("User abort!")
            return

    # Merge json
    json_merges = [
        # Merge json_file1 and json_file2 into json_file_output
        #[
        #    json_file1,
        #    json_file2,
        #    json_file_output'
        #]
    ]
    # Append file
    file_merges = [
        # Append new content to appened file.
        #[
        #    file_path_base,
        #    file_path_append',
        #    json_file_output'
        #],
    ]
    # Copy file (overwrite)
    file_copys = [
        # Copy from src to dest
        #[
        #    file_copy_path_src,
        #    file_copy_path_dest'
        #],
    ]
    for p1 in [p for p, d, f in walklevel(optional_dir) if "webui-vue" in d]:
        print("NOTE: Add webui-vue feature: %s" % p1.replace(optional_dir + '/', '', 1))
        p1 += "/webui-vue"
        print("Find optional: %s" % p1)
        for p2, d2, f2 in os.walk(p1):
            # Initial variable
            if len(f2) == 0:
                continue
            done_file = {}
            for f3 in f2:
                done_file[f3] = False
            # Start search merged files
            for (pm, fm) in [('/src/env/insyde/json', 'menu.json'), ('/src/locales', '*.json'), ('/src/env/insyde/locales', '*.json')]:
                if p1 + pm == p2:
                    if '*' in fm:
                        for fl in [f for f in f2 if f.endswith(fm.lstrip('*'))]:
                            print("Merge %s/%s" % (p2, fl))
                            done_file[fl] = True
                            json_merges.append([
                                "{}{}/{}".format(srcdir, pm, fl),
                                "{}/{}".format(p2, fl),
                                "{}{}/{}".format(outdir, pm, fl)
                            ])
                    else:
                        print("Merge %s/%s" % (p2, fm))
                        done_file[fm] = True
                        json_merges.append([
                            "{}{}/{}".format(srcdir, pm, fm),
                            "{}/{}".format(p2, fm),
                            "{}{}/{}".format(outdir, pm, fm)
                        ])
            # Start search Appended files
            for (pa, fa) in [('/src/env/router', 'insyde.js'), ('/src/env/store', 'insyde.js')]:
                if p1 + pa == p2:
                    if '*' in fa:
                        for fl in [f for f in f2 if f.endswith(fa.lstrip('*'))]:
                            print("Append %s/%s" % (p2, fl))
                            done_file[fa] = True
                            file_merges.append([
                                "{}{}/{}".format(srcdir, pa, fl),
                                "{}/{}".format(p2, fl),
                                "{}{}/{}".format(outdir, pa, fl)
                            ])
                    else:
                        print("Append %s/%s" % (p2, fa))
                        done_file[fa] = True
                        file_merges.append([
                            "{}{}/{}".format(srcdir, pa, fa),
                            "{}/{}".format(p2, fa),
                            "{}{}/{}".format(outdir, pa, fa)
                        ])
            # Start search copied files, all the other files are copied.
            for fc, done in done_file.items():
                if not done:
                    print("Copy %s/%s" % (p2, fc))
                    file_copys.append([
                        "{}/{}".format(p2, fc),
                        "{}{}/{}".format(outdir, p2.replace(p1, '', 1), fc)
                    ])

    # Do merge json
    print("Do merge json")
    try:
        for json_case in json_merges:
            print("Merge json: %s, %s to %s" % (json_case[0], json_case[1], json_case[2]))
            json_merge(json_case[0], json_case[1], json_case[2])
    except Exception as e:
        print("Merge json error, %s" % e)
        sys.exit(1)

    # Do append file
    print("Do append file")
    try:
        for file_case in file_merges:
            print("Append file: %s, %s to %s" % (file_case[0], file_case[1], file_case[2]))
            file_merge(file_case[0], file_case[1], file_case[2])
            remove_duplicate_pattern(r'^\s*import\s+([^\s]+)', file_case[2], file_case[2])
    except Exception as e:
        print("Append file error, %s" % e)
        sys.exit(1)

    # Do copy file (overwrite)
    print("Do copy file")
    try:
        for file_copy in file_copys:
            print("Copy file: %s to %s" % (file_copy[0], file_copy[1]))
            dir = os.path.dirname(file_copy[1])
            if not os.path.isdir(dir):
                os.makedirs(dir, mode=0o755)
            shutil.copy(file_copy[0], file_copy[1])
    except Exception as e:
        print("Copy file error, %s" % e)
        sys.exit(1)

def usage():
    print("Usage: {} [OPTIONS] <path to optional dir>".format(sys.argv[0]))
    print("OPTIONS: -h, --help; show this help message and exit.")
    print("         -y, --yes, --assume-yes; automatic yes to prompts; assume \"yes\" as answer to all prompts and run non-interactively.")


if __name__ == "__main__":
    try:
        opts, args = getopt.getopt(sys.argv[1:], "yh", ["yes", "assume-yes", "help"])
    except getopt.GetoptError as err:
        # print help information and exit:
        usage()
        sys.exit(2)
    assumeYes = False
    for o, a in opts:
        if o in ("-y", "--yes", "--assume-yes"):
            assumeYes = True
        elif o in ("-h", "--help"):
            usage()
            sys.exit()
        else:
            assert False, "unhandled option"

    if len(args) != 1:
        usage()
    else:
        add_optional_features(*args)