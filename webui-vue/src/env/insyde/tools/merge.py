# Module file: merge.py
import os
import sys
import json
import re

def dict_key_duplicates(ordered_pairs):
    d = {}
    for k, v in ordered_pairs:
        if k in d:
            print("DUPLICATE KEY: %r" % k)
        else:
            d[k] = v
    return d

def merge(a, b, path=None):
    if path is None: path = []
    for key in b:
        if key in a:
            if isinstance(a[key], dict) and isinstance(b[key], dict):
                merge(a[key], b[key], path + [str(key)])
            elif a[key] == b[key]:
                pass # same leaf value
            else:
                raise Exception('Conflict KEY: %r' % '.'.join(path + [str(key)]))
        else:
            a[key] = b[key]
    return a

def json_merge(base_file, append_file, out_file):
    with open(base_file, 'r') as base_f:
        base_dict = json.loads(base_f.read(), object_pairs_hook=dict_key_duplicates)
    with open(append_file, 'r') as append_f:
        append_dict = json.loads(append_f.read(), object_pairs_hook=dict_key_duplicates)

    try:
        merged_dict = merge(base_dict, append_dict)
    except Exception as e:
        raise Exception(base_file, append_file, e)
    with open(out_file, 'w') as out_f:
        json.dump(merged_dict, out_f, ensure_ascii=False, indent=2)

def file_merge(base_file, append_file, out_file):
    with open(base_file, 'r') as base_f:
        lines1 = base_f.readlines()
    with open(append_file, 'r') as append_f:
        lines2 = append_f.readlines()
    with open(out_file, 'w') as out_f:
        for line in lines1:
            out_f.write(line)
        for line in lines2:
            out_f.write(line)

def remove_duplicate_pattern(pattern, file_in, file_out):
    lines_seen = set() # holds lines already seen
    with open(file_in, 'r') as fd_in:
        lines = fd_in.readlines()
    with open(file_out, 'w') as fd_out:
        for line in lines:
            match = re.search(pattern, line)
            if match:
                if match.group(1) not in lines_seen: # not a duplicate
                    fd_out.write(line)
                    lines_seen.add(match.group(1))
            else:
                fd_out.write(line)
# remove_duplicate_pattern(r'^\s*import\s+([^\s]+)', file_in, file_out)