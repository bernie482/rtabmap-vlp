#!/usr/bin/env python3
import os
import sys
import re
import json
import codecs

'''
TODO
add depends.json
add removing files functionality
remove config.json
remove config.py
'''

def get_basic_menu():
    menufile = os.environ.get('MENU_JSON') # menu.json

    try:
        with open(menufile, 'r') as fin:
            menu = fin.read()
    except:
        print('[Web UI] Error: Fail to open %s' % menufile)
        sys.exit(1)

    try:
        menu = json.loads(menu)
    except:
        print('[Web UI] Error: Invalid JSON file %s' % menufile)
        sys.exit(1)

    return menu

def get_optional_menu(menu):
    menufiles = []

    if not os.environ.get('OPTIONAL'):
        return

    for optdir in os.environ.get('OPTIONAL').split() + os.environ.get('OEMOPTIONAL').split():
        menufile = optdir + 'menu.json'
        if os.path.isfile(menufile):
            menufiles.append(menufile)

    for f in menufiles:
        try:
            with open(f, 'r') as fin:
                menufile = fin.read()
        except:
            print('[Web UI] Warning: Fail to open %s' % f)
            continue

        try:
            optional_menu = json.loads(menufile)
        except:
            print('[Web UI] Warning: Invalid JSON file %s' % f)
            continue

        for tab,tabval in optional_menu.items():
            if tab not in menu.get('tabs'):
                if tabval.get('order'):
                    menu.get('tabs').insert(tabval.get('order'), tab)
                else:
                    menu.get('tabs').append(tab)
                menu[tab] = tabval
            else:
                for page,pageval in tabval.items():
                    if page not in menu[tab].get('pages'):
                        menu[tab].get('pages').append(page)
                    menu[tab][page] = pageval


def get_optional_lang(lang):
    langfiles = []

    if not os.environ.get('OPTIONAL'):
        return

    opt_lang_files = [] #language files for optional page.
    lang_files = []     #language files for common page.

    json_folder = os.environ.get('WEBUIOUT') + '/' + os.environ.get('JSON_DIR')
    if json_folder:
        try:
            lang_files = [ os.path.join(root, f) for root, dirs, files in os.walk(json_folder) for f in files if re.match(r"^lang-.*\.json$", f, re.IGNORECASE) ]
        except:
            lang_files = []

    # Enumerate each optional/oem_optional webui folders.
    optdirs = os.environ.get('OPTIONAL').split() + os.environ.get('OEMOPTIONAL').split()
    for optdir in optdirs:
        if optdir:
            try:
                opt_lang_files = [ os.path.join(root, f) for root, dirs, files in os.walk(optdir) for f in files if re.match(r"^lang-.*\.json$", f, re.IGNORECASE) ]
            except:
                opt_lang_files = []
        # Enumerate each language string table under optional/oem_optional.
        for opt_lang_file in opt_lang_files:
            #print('Optional language file: %s' % opt_lang_file)
            try:
                with open(opt_lang_file, 'r') as fin:
                    #print('    open opt lang: %s' % opt_lang_file)
                    buff = fin.read()
                    opt_lang = json.loads(buff, object_pairs_hook=dict_key_duplicates)
            except:
                print('')
                print('Language, Invalid JSON file %s' % f)

            opt_lang_basename = os.path.basename(opt_lang_file)
            #print('Optional language file: %s ' % opt_lang_basename)
            f = json_folder + "/" + opt_lang_basename
            try:
                with open(f, 'r') as fin:
                    #print('    open common lang: %s' % f)
                    buff = fin.read()
                    common_lang = json.loads(buff, object_pairs_hook=dict_key_duplicates)
            except:
                print('')
                print('Language, Invalid JSON file %s' % f)

            if 'opt_lang' in locals() and 'common_lang' in locals():
                # print('    [%s]'% opt_lang_file)
                for key in opt_lang.keys():
                    if key in common_lang:
                        # print('        replace key[%s] %s -> %s' % (key, common_lang[key], opt_lang[key]))
                        common_lang[key] = opt_lang[key]
                    else:
                        common_lang[key] = opt_lang[key]
                        # print('        insert  key[%s]:%s' % (key, common_lang[key]))

                # output here
                f = json_folder + "/" + opt_lang_basename
                with open(f, 'w') as fout:
                    json.dump(common_lang, fout, ensure_ascii=False, indent=4)
    return 0

def filter_rule_s1(menus):
    for page, pageval in list(menus.items()):
        if not isinstance(pageval, dict):
            continue
        if pageval.get('depends'):
            for dep in pageval['depends']:
                if dep not in os.environ:
                    print('Filter out page "%s" [%s][n] from menu.json' % (page, dep))
                    del menus[page]
                    break
        if menus.get(page) and pageval.get('children'):
            filter_rule_s1(pageval['children'])

def filter_rule_s2(menus):
    for page, pageval in list(menus.items()):
        if not isinstance(pageval, dict):
            continue
        if pageval.get('children'):
            filter_rule_s2(pageval['children'])
        if pageval.get('route'):
            continue
        if pageval.get('children') and len(pageval['children']) > 0:
            continue
        print('Filter out page "%s" with empty children' % (page))
        del menus[page]

def filter_menu_s3(menus):
    for page, pageval in list(menus.items()):
        if 'depends' in pageval:
            # print('Remove depends of:', page)
            del pageval['depends']
        if pageval.get('children'):
            filter_menu_s3(pageval['children'])

def filter_menu():
    '''
    Get
    <SDK>/web/webui/menu.json
    <SDK>/web/optional/*/webui/menu.json
    save in dictionary "menu"
    filter by dependency and generate new <SDK>/out/web/json/menu.json
    '''
    print('>> Filter menu.json')

    menus = get_basic_menu()

    # get_optional_menu(menu)

    # s1) filter out page
    # print('menus:', menus)
    filter_rule_s1(menus)
    # print('menus_s1:', menus)

    # s2) if all children are gone, remove group page
    filter_rule_s2(menus)
    # print('menus_s2:', menus)

    # s3) remove depends in menu
    filter_menu_s3(menus)
    # print('menus_s3:', menus)

    path = os.environ.get('WEBUIOUT_MENU_JSON')
    try:
        with open(path, 'wt') as outfile:
            json.dump(menus, outfile)
    except:
        print('[Web UI] Error: Fail to generate filtered menu.json %s' % path)
        sys.exit(1)

    print('Finish generating %s' % path)


def append_lang_str():
    '''
    Get
    <SDK>/web/optional/*/webui/json/lang-*.json
    '''
    print('>> Merge optional language json')

    langs = []
    get_optional_lang(langs)
    return 0


def remove_unused_tag(content, depends_begin, depends_end):
    sub_total_count = 0
    for ele in depends_begin:
        (content, sub_count) = re.subn(re.compile(r'(//)?\s*<!--\s*WEB_CONFIG_DEPEND_FEATURE_BEGIN\s*:\s*\(?\s*' + re.escape(ele) + r'\s*\)?\s*-->\s*\n*'), '', content)
        sub_total_count += sub_count
    for ele in depends_end:
        (content, sub_count) = re.subn(re.compile(r'(//)?\s*<!--\s*WEB_CONFIG_DEPEND_FEATURE_END\s*:\s*\(?\s*' + re.escape(ele) + r'\s*\)?\s*-->\s*\n*'), '', content)
        sub_total_count += sub_count
    return (content, sub_total_count > 0)

def remove_unused_code_by_config(f, content):
    depends_begin = re.findall(r'<!--\s*WEB_CONFIG_DEPEND_FEATURE_BEGIN\s*:\s*(!?[\w_]*)\s*-->', content)
    depends_end = re.findall(r'<!--\s*WEB_CONFIG_DEPEND_FEATURE_END\s*:\s*(!?[\w_]*)\s*-->', content)

    done = []

    for ele in depends_begin:
        # continue if CONFIG_XXX_XXX has begin but no end
        if ele not in depends_end:
            continue

        if len(ele.split('!')) > 1:
            if ele.split('!')[1] not in os.environ:
                continue
        # continue if CONFIG_XXX_XXX is defined in .config
        elif ele in os.environ:
            continue

        redepends = r'(//)?\s*<!--\s*WEB_CONFIG_DEPEND_FEATURE_BEGIN\s*:\s*' + re.escape(ele) + r'\s*-->.*?<!--\s*WEB_CONFIG_DEPEND_FEATURE_END\s*:\s*' + re.escape(ele) + r'\s*-->'
        content = re.sub(re.compile(redepends, re.DOTALL) ,'' ,content)
        done.append((ele, f))

    (content, modified) = remove_unused_tag(content, depends_begin, depends_end)
    return content, done, (modified or len(done) > 0)

def remove_unused_code_by_user_policy(f, content):
    depends_begin = re.findall(r'<!--\s*WEB_CONFIG_DEPEND_FEATURE_BEGIN\s*:\s*([\w_]*\(\d\))\s*-->', content)
    depends_end = re.findall(r'<!--\s*WEB_CONFIG_DEPEND_FEATURE_END\s*:\s*([\w_]*\(\d\))\s*-->', content)

    # there are 3 level username policy and 3 level username policy
    # CONFIG_USER_POLICY_LEVEL(0)
    # CONFIG_PASSWORD_POLICY_LEVEL(0)
    # keep current policy level set by menuconfig and other level
    user_policy = 'CONFIG_USER_POLICY_LEVEL(%s)' % os.environ.get('CONFIG_USER_POLICY_LEVEL')
    passwd_policy = 'CONFIG_PASSWORD_POLICY_LEVEL(%s)' % os.environ.get('CONFIG_PASSWORD_POLICY_LEVEL')

    done = []

    for ele in depends_begin:
        # continue if meet current policy level
        if (ele == user_policy or ele == passwd_policy) and ele in depends_end:
            continue

        redepends = r'(//)?\s*<!--\s*WEB_CONFIG_DEPEND_FEATURE_BEGIN\s*:\s*' + re.escape(ele) + r'\s*-->.*?<!--\s*WEB_CONFIG_DEPEND_FEATURE_END\s*:\s*' + re.escape(ele) + r'\s*-->'
        content = re.sub(re.compile(redepends, re.DOTALL) ,'' ,content)
        done.append((ele, f))

    (content, modified) = remove_unused_tag(content, depends_begin, depends_end)
    return content, done, (modified or len(done) > 0)

def remove_unused_code_by_config_group(f, content):
    depends_begin = re.findall(r'<!--\s*WEB_CONFIG_DEPEND_FEATURE_BEGIN\s*:\s*\(((?:[\w_ ]|\|\||&&)*)\)\s*-->', content)
    depends_end = re.findall(r'<!--\s*WEB_CONFIG_DEPEND_FEATURE_END\s*:\s*\(((?:[\w_ ]|\|\||&&)*)\)\s*-->', content)

    done = []

    for ele in depends_begin:
        # continue if CONFIG_XXX_XXX has begin but no end
        if ele not in depends_end:
            continue

        m = re.match('([\w_]*)\s*(\|\||&&)\s*(.*)', ele)
        if not m:
            configs_has_defined = bool(os.environ.get(ele.strip()))
        else:
            configs_has_defined = bool(os.environ.get(m.groups()[0].strip()))
            current_operator = m.groups()[1].strip()
            remain = m.groups()[2].strip()

        while remain:
            m = re.match('([\w_]*)\s*(\|\||&&)\s*(.*)', remain)
            if not m:
                if current_operator == '||':
                    configs_has_defined = bool(configs_has_defined or os.environ.get(remain))
                elif current_operator == '&&':
                    configs_has_defined = bool(configs_has_defined and os.environ.get(remain))
                break
            current_config = m.groups()[0].strip()
            next_operator = m.groups()[1].strip()
            remain = m.groups()[2].strip()
            if current_operator == '||':
                configs_has_defined = bool(configs_has_defined or os.environ.get(current_config))
            elif current_operator == '&&':
                configs_has_defined = bool(configs_has_defined and os.environ.get(current_config))
            current_operator = next_operator

        if configs_has_defined:
            continue

        redepends = r'(//)?\s*<!--\s*WEB_CONFIG_DEPEND_FEATURE_BEGIN\s*:\s*\(' + re.escape(ele) + r'\)\s*-->.*?<!--\s*WEB_CONFIG_DEPEND_FEATURE_END\s*:\s*\(' + re.escape(ele) + r'\)\s*-->'
        content = re.sub(re.compile(redepends, re.DOTALL) ,'' ,content)
        done.append((ele, f))

    (content, modified) = remove_unused_tag(content, depends_begin, depends_end)
    return content, done, (modified or len(done) > 0)

def remove_unused_code():
    '''
    remove code wrap by these line:
    <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_FPGA_FW_UPD -->
    <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_FPGA_FW_UPD -->
    '''

    vue_folder = os.environ.get('WEBUIOUT_VUE_DIR')
    vue_files = []
    if vue_folder:
        try:
            vue_files = [ os.path.join(root, f) for root, dirs, files in os.walk(vue_folder) for f in files if re.match(r"^.*\.vue$", f, re.IGNORECASE) ]
        except:
            vue_files = []

    www_folder = os.environ.get('WEBUIOUT_PAGE_DIR')
    www_files = []
    if www_folder:
        try:
            www_files = [ os.path.join(root, f) for root, dirs, files in os.walk(www_folder) for f in files if re.match(r"^.*\.www$|^.*\.html$", f, re.IGNORECASE) ]
        except:
            www_files = []

    js_folder = os.environ.get('WEBUIOUT_JS_DIR')
    js_files = []
    if js_folder:
        try:
            js_files = [ os.path.join(root, f) for root, dirs, files in os.walk(js_folder) for f in files if re.match(r"^.*\.js$", f, re.IGNORECASE) ]
        except:
            js_files = []
            return

    css_folder = os.environ.get('WEBUIOUT_CSS_DIR')
    css_files = []
    if css_folder:
        try:
            css_files = [ os.path.join(root, f) for root, dirs, files in os.walk(css_folder) for f in files if re.match(r"^.*\.ccs$|^.*\.scss$", f, re.IGNORECASE) ]
        except:
            css_files = []
            return

    help_folder = os.environ.get('WEBUIOUT_HELP_DIR')
    help_files = []
    if help_folder:
        try:
            help_files = [ os.path.join(root, f) for root, dirs, files in os.walk(help_folder) for f in files if re.match(r"^.*\.html$|^.*\.js$", f, re.IGNORECASE) ]
        except:
            help_files = []

    done = []
    modified = []

    for f in www_files + help_files + js_files + css_files + vue_files:
        with codecs.open(f, 'r', 'utf-8') as fin:
            content = fin.read()
        result = remove_unused_code_by_config(f, content)
        done.extend(result[1])
        if (result[2]):
            modified.append(f)
        result = remove_unused_code_by_user_policy(f, result[0])
        done.extend(result[1])
        if (result[2]):
            modified.append(f)
        result = remove_unused_code_by_config_group(f, result[0])
        done.extend(result[1])
        if (result[2]):
            modified.append(f)
        # if the content is the same, skip to write file
        if len(result[0]) != len(content):
            content = result[0]
            with codecs.open(f, 'w', 'utf-8') as outfile:
                print(content, file=outfile)

    # remove duplicate element
    res = []
    for ele, f in done:
        if (ele, f) not in res:
            res.append((ele, f))
    done = res

    if done:
        print('>> Remove config depends code')
        done.sort(key=lambda tup: tup[0])

    for ele, f in done:
        print('REMOVE CODE: [%s][n] depends code removed from %s' % (ele, f))

    #Automatically run eslint fix if set WEBUIOUT_ESLINT_FIX=1
    eslint_fix = os.environ.get('WEBUIOUT_ESLINT_FIX')
    if (eslint_fix and int(eslint_fix) > 0):
        for f in modified:
            from subprocess import PIPE, run
            print('FILE MODIFIED: [%s]' % (f))
            runstr = "node_modules/eslint/bin/eslint.js --fix %s" % (f)
            result = run(runstr, stdout=PIPE, stderr=PIPE, universal_newlines=True, shell=True).stdout.rstrip()
            print('RUN: [%s], RET: [%s]' % (runstr, result))

def dict_key_duplicates(ordered_pairs):
    d = {}
    for k, v in ordered_pairs:
        if k in d:
            print("DUPLICATE KEY: %r" % (k,))
        else:
            d[k] = v
    return d

def language_validation():
    print('>> String table validation')
    json_folder = os.environ.get('WEBUIOUT') + '/' + os.environ.get('JSON_DIR')
    lang_files = []
    if json_folder:
        try:
            lang_files = [ os.path.join(root, f) for root, dirs, files in os.walk(json_folder) for f in files if re.match(r"^lang-.*\.json$", f, re.IGNORECASE) ]
        except:
            lang_files = []

    for f in lang_files:
        print('%s '%os.path.basename(f))
        try:
            with open(f, 'r') as fin:
                buff = fin.read()
                lang = json.loads(buff, object_pairs_hook=dict_key_duplicates)
                for item in lang:
                    if len(lang[item]) < 1:
                        print("  Empty string of key:%s"%item)
        except JSONDecodeError as e:
            print(e)
            print('ERROR: Language, Invalid JSON file %s' % f)
            sys.exit(1)
        except Exception as e:
            print('')
            print(e, type(e))
            print('ERROR: Language, Invalid JSON file %s' % f)
            sys.exit(1)

        print('  (done)')

def main():
    print('============================')
    print('Start build.py')
    print('============================')

    print('1) filter_menu...')
    filter_menu()

    print('2) remove_unused_code...')
    remove_unused_code()

    #append_lang_str()

    #language_validation()
    print('3) done...')

if __name__ == '__main__':
    main()
