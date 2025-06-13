import Converter from '@/env/insyde/utilities/Converter';

// general function
var setRegexp = function (regexp, flags) {
  return Defined(flags) ? RegExp(regexp, flags) : RegExp(regexp);
};

var checkRegexp = function (regexp, obj, flags) {
  let regExp = setRegexp(regexp, flags);
  // console.log(regExp);
  return regExp.test(obj);
};

var removeComment = function (regexp) {
  return StringType(regexp)
    ? regexp.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '')
    : '';
};

var trimRegex = function (regexp) {
  return StringType(regexp) ? regexp.replace(/(\r\n|r\|\n|\s)/gm, '') : '';
};

var regexProceed = function (regex) {
  regex = removeComment(regex);
  regex = trimRegex(regex);
  return regex;
};

// Basic Type
{
  var Defined = function (d) {
    return typeof d !== 'undefined';
  };
  var NullType = function (n) {
    return n === null;
  };
  var NumberType = function (num) {
    return typeof num === 'number' && Number.isFinite(num);
  };
  var StringType = function (s) {
    return typeof s === 'string';
  };
  var BooleanType = function (b) {
    return typeof b === 'boolean';
  };
  var ObjectType = function (o) {
    return typeof o === 'object';
  };
  var PromiseType = function (p) {
    return (
      ObjectType(p) &&
      Defined(p) &&
      !NullType(p) &&
      Defined(p.then) &&
      FunctionType(p.then)
    );
  };
  var FunctionType = function (f) {
    return typeof f === 'function';
  };
  var ArrayType = function (a) {
    return Array.isArray(a);
  };
  var ElementType = function (e) {
    return (
      e instanceof Element ||
      e instanceof HTMLElement ||
      e instanceof HTMLDocument
    );
  };
}

// Array
{
  var hasInArray = function (arr, d) {
    return ArrayType(arr) && Array.prototype.indexOf.call(arr, d) != -1;
  };

  var InternalForIncreasingCheck = function (arr, strict) {
    let resultStrs = [];
    arr.forEach(function (str) {
      if (arr.length >= strict) {
        let words = str.split('');
        let record = [];
        let sort = 0;
        let checkStr;
        words.forEach(function (data, index, arr) {
          if (words.length <= index + 1) {
            if (sort === 0) {
              resultStrs.push(data);
            } else {
              if (sort == getSort(data, checkStr)) {
                record.push(data);
              } else {
                resultStrs.push(data);
              }
              resultStrs.push(record.join(''));
              record = [];
            }
          } else {
            //check
            if (sort === 0) {
              sort = getSort(arr[index + 1], data);
              sort = sort === 1 || sort === -1 ? sort : 0;
              if (sort === 0) {
                resultStrs.push(data);
              } else {
                checkStr = data;
                record.push(data);
              }
            } else {
              if (sort === getSort(data, checkStr)) {
                checkStr = data;
                record.push(data);
              } else {
                resultStrs.push(record.join(''));
                record = [];
                sort = getSort(arr[index + 1], data);
                sort = sort === 1 || sort === -1 ? sort : 0;
                if (sort === 0) {
                  resultStrs.push(data);
                } else {
                  checkStr = data;
                  record.push(data);
                }
              }
            }
          }
        });
      }
    });

    function getSort(data, target) {
      return data.charCodeAt() - target.charCodeAt();
    }

    return resultStrs.some(function (data) {
      return data.length >= strict;
    });
  };

  var InternalForDuplcateCheck = function (arr, strict) {
    let record = {};
    return arr.some(function (char) {
      //if (record.hasOwnProperty(char)) {
      if (Object.prototype.hasOwnProperty.call(record, char)) {
        record[char]++;
      } else {
        record[char] = 1;
      }
      return record[char] >= strict;
    });
  };
}

// Object
{
  var NoopObject = function (o) {
    return ObjectType(o) && Object.keys(o).length <= 0;
  };
}

// String
{
  var Length = function (num, str) {
    num = num || 127;
    return str.length <= num;
  };

  var EmptyString = function (str) {
    return StringType(str) && str.length <= 0;
  };

  var NonEmptyString = function (str) {
    return StringType(str) && str.length > 0;
  };

  var StringLengthRange = function (max, min, str) {
    max = max || 127;
    min = min || 0;
    return min <= str.length && str.length <= max;
  };

  var LowerCase = function (str) {
    return checkRegexp(/^[a-z]+$/g, str);
  };

  var UpperCase = function (str) {
    return checkRegexp(/^[A-Z]+$/g, str);
  };

  var Alphabet = function (str) {
    return checkRegexp(/^[A-Za-z]+$/g, str);
  };

  var PrintableChar = function (str) {
    return checkRegexp(/^[\x20-\x7E]*$/, str);
  };

  var NOTWhiteSpacePrintableChar = function (str) {
    return checkRegexp(/^[\x21-\x7E]+$/, str);
  };

  var ContainLowerCase = function (str) {
    return checkRegexp(/[a-z]/g, str);
  };

  var ContainUpperCase = function (str) {
    return checkRegexp(/[A-Z]/g, str);
  };

  var LetterCode = function (str) {
    return checkRegexp(/^[A-Za-z]{2}$/g, str);
  };

  var ContainAlphabet = function (str) {
    return checkRegexp(/[A-Za-z]/g, str);
  };

  var StringRule = function (str) {
    return checkRegexp(/^[A-Za-z0-9]+([ _\-.][A-Za-z0-9]+)*$/, str);
  };

  var StringCompare = function (str1, str2) {
    return (
      StringType(str1) &&
      StringType(str2) &&
      str1.normalize() === str2.normalize()
    );
  };

  var ContainIncreasingAlphabet = function (str, num, sensitive) {
    num = num != undefined ? parseInt(num) : 0;
    num = num >= 25 ? 25 : num < 0 ? 0 : num;
    if (num != 0) {
      sensitive = sensitive != undefined ? sensitive : false;
      if (sensitive) {
        let UpperStrs = str.match(/([A-Z]+)/g) || [];
        let LowerStrs = str.match(/([a-z]+)/g) || [];
        return (
          InternalForIncreasingCheck(UpperStrs, num) ||
          InternalForIncreasingCheck(LowerStrs, num)
        );
      } else {
        let charStrs = str.match(/([A-Za-z]+)/g) || [];
        return InternalForIncreasingCheck(charStrs, num);
      }
    } else {
      return false;
    }
  };

  var ContainContinuousAlphabet = function (str, num) {
    num = num != undefined ? parseInt(num) : 0;
    return num != 0
      ? !checkRegexp('^(?!.*?[a-zA-Z]{' + num + '}).+$', str, 'g')
      : false;
  };

  var ContainDuplicateAlphabet = function (str, num, sensitive) {
    num = num < 0 ? 0 : num;
    if (num != 0) {
      sensitive = sensitive != undefined ? sensitive : false;
      if (sensitive) {
        let UpperStrs = str.match(/([A-Z])/g) || [];
        let LowerStrs = str.match(/([a-z])/g) || [];
        return (
          InternalForDuplcateCheck(UpperStrs, num) ||
          InternalForDuplcateCheck(LowerStrs, num)
        );
      } else {
        let charStrs = str.match(/([A-Za-z])/g) || [];
        return InternalForDuplcateCheck(charStrs, num);
      }
    } else {
      return false;
    }
  };

  // var StringNonSymbol = function(str){
  //     return checkRegexp(/^[a-zA-Z0-9]+$/, str);
  // }

  var _specialChar = [
    ' ',
    '!',
    '#',
    '$',
    '%',
    '&',
    '(',
    ')',
    '*',
    '+',
    '-',
    '.',
    ',',
    "'",
    '"',
    '/',
    ':',
    ';',
    '<',
    '>',
    '=',
    '?',
    '@',
    '[',
    ']',
    '\\',
    '^',
    '_',
    '`',
    '{',
    '|',
    '}',
    '~',
  ];

  var NonSpecialChar = function (str, filter, append) {
    return !ContainSpecialChar(str, filter, append);
  };

  var ContainSpecialChar = function (str, filter, append) {
    filter = filter ? filter.split('') : [];
    append = append ? append.split('') : [];
    let copySpecialChar = _specialChar.slice();
    // add append
    append.forEach((a) => {
      if (copySpecialChar.indexOf(a) == -1) {
        copySpecialChar.push(a);
      }
    });
    return ContainSpecificChar(
      str,
      copySpecialChar.filter((char) => filter.indexOf(char) == -1).join('')
    );
  };

  var ContainSpecificChar = function (str, custom) {
    if (custom instanceof RegExp) return checkRegexp(custom, str);
    if (custom && StringType(custom)) {
      custom = custom.split('');
      let Chars = custom.reduce((tokenStr, char) => {
        switch (char) {
          case '(':
          case ')':
          case '/':
          case '.':
          case '+':
          case '-':
          case '?':
          case '*':
          case '[':
          case ']':
          case '\\':
            return tokenStr + '\\' + char;
          default:
            return tokenStr + char;
        }
      }, '');
      return checkRegexp('[' + Chars + ']', str, 'g');
    }
    return false;
  };
}

// Number
{
  var NumberRule = function (str) {
    return checkRegexp(/^[-]{0,1}\d+$/, str);
  };

  var HexRule = function (str) {
    return checkRegexp(/^0x[\d]+$/, str);
  };

  var NonZeroNumberRule = function (str) {
    return checkRegexp(/^[1-9]\d*$/, str);
  };

  var ContainNumber = function (str) {
    return checkRegexp(/\d/, str);
  };

  var ContainIncreasingNumber = function (str, num) {
    num = num != undefined ? parseInt(num) : 0;
    num = num >= 10 ? 10 : num < 0 ? 0 : num;
    if (num != 0) {
      let numStrs = str.match(/(\d+)/g) || [];
      return InternalForIncreasingCheck(numStrs, num);
    } else {
      return false;
    }
  };

  var ContainContinuousNumber = function (str, num) {
    num = num != undefined ? parseInt(num) : 0;
    return num != 0
      ? !checkRegexp('^(?!.*?\\d{' + num + '}).+$', str, 'g')
      : false;
  };

  var ArgNumber = function (...args) {
    return args.every((num) => NumberRule(num));
  };

  var Less = function (num, str) {
    return ArgNumber(num, str) && parseInt(str) < parseInt(num);
  };

  var More = function (num, str) {
    return ArgNumber(num, str) && parseInt(str) > parseInt(num);
  };

  var Less_Equal = function (num, str) {
    return ArgNumber(num, str) && parseInt(str) <= parseInt(num);
  };

  var More_Equal = function (num, str) {
    return ArgNumber(num, str) && parseInt(str) >= parseInt(num);
  };

  var Equal = function (num, str) {
    return ArgNumber(num, str) && parseInt(str) == parseInt(num);
  };

  var Range = function (min, max, str) {
    return (
      ArgNumber(min, max, str) && Less_Equal(max, str) && More_Equal(min, str)
    );
  };

  var Range_Strict = function (min, max, str) {
    return ArgNumber(min, max, str) && Less(max, str) && More(min, str);
  };

  var Static_Number = function (nums, str) {
    if (!ArgNumber(str)) return false;
    if (ArrayType(nums)) {
      let result = false;
      if (!nums.every((num) => NumberRule(num))) return false;
      nums.forEach(function (num) {
        if (parseInt(str) == parseInt(num)) {
          result = true;
        }
      });
      return result;
    } else {
      return ArgNumber(nums) && parseInt(str) == parseInt(nums);
    }
  };
}

// Function
{
  // User Usage
  {
    var UserName = function (str) {
      return checkRegexp(
        /^([a-zA-Z][0-9a-zA-Z\-_.]*(@[1-9a-zA-Z\-_.]+)?)?$/,
        str
      );
    };

    var UserName_Strict = function (str) {
      return checkRegexp(/^[A-Za-z0-9]+([ _\-.][A-Za-z0-9]+)*$/, str);
    };

    var Password = function (str) {
      return checkRegexp(/^[ -~]*$/, str);
    };

    var UserNameSamba = function (str) {
      return checkRegexp(
        /^([a-zA-Z0-9!][0-9a-zA-Z\-_.]*(@[1-9a-zA-Z\-_.]+)?)?$/,
        str
      );
    };
  }

  // Email
  {
    var _emailLocalRegex = {
      // Replace
      // non double quotes
      nonDoubleQuotesReplace: `
                [
                    a-zA-Z                          // uppercase and lowercase latin letters
                    0-9                             // digits
                    !#$%&'*+/=?^_\`{|}~-       // printable characters
                ]
                +                               // one or more times
            `,
      // double quotes
      doubleQuoteReplace: `
                \\"           // "
                (?:
                    \\\\\\"         //   "
                    |               // or
                    \\\\\\\\        //   \\
                    |               // or
                    [
                        ^               // not
                        \\\\            // \\
                        \\"             // "
                    ]
                )
                *             // zero or more times
                \\"           // "
            `,
      // need to do after filter double quotes section.
      commentReplace: `
                \\(         // (
                    [
                        ^           // not
                        \\(         // (
                        \\)         // )
                    ]
                    *           // zero or more times
                \\)         // )
            `,
      // Check
      dotCheck: `
                ^               // start
                    n               // letter n
                    (?:             // Group Start
                        \\.             // dot(.)
                        n               // letter n
                    )               // Group End
                    *               // zero or more
                $               // end
            `,
      doubleQuoteDotCheck: `
                ^
                    (?:
                        [
                            a-zA-Z                          // uppercase and lowercase latin letters
                            0-9                             // digits
                            !#$%&'*+/=?^_\`{|}~-       // printable characters
                        ]
                        +                               // one or more times
                        |
                        (?:
                            \\"
                            \\"
                        )
                    )
                    (?:
                        \\.
                        (?:
                            [
                                a-zA-Z                          // uppercase and lowercase latin letters
                                0-9                             // digits
                                !#$%&'*+/=?^_\`{|}~-       // printable characters
                            ]
                            +                               // one or more times
                            |
                            (?:
                                \\"
                                \\"
                            )
                        )
                    )
                    *
                $
            `,
      commentCheck: `
                ^       // start
                    (?:
                        \\(      // (
                            [
                                ^           // not
                                \\(         // (
                                \\)         // )
                            ]
                            *           // zero or more times
                        \\)         // )
                    )
                    {0, 1}      // zero or more times
                    [
                        ^           // not
                        \\(         // (
                        \\)         // )
                    ]
                    +           // one or more
                    (?:
                        \\(         // (
                            [
                                ^       // not
                                \\(     // (
                                \\)     // )
                            ]
                            *           // zero or more times
                        \\)         // )
                    )
                    {0, 1}      // zero or once
                $
            `,
    };

    var doubleQuoteContentChecker = function (str) {
      // check \" and remove it
      str = str.replace(/\\"/g, '');
      // if still have any " , then fail
      if (str.indexOf('"') != -1) return false;
      // check \\ and remove it
      str = str.replace(/\\\\/g, '');
      // if still have any \ , then fail
      if (str.indexOf('\\') != -1) return false;
      return true;
    };

    Object.keys(_emailLocalRegex).forEach((name) => {
      _emailLocalRegex[name] = regexProceed(_emailLocalRegex[name]);
    });

    var EmailLocalPart = function (str) {
      // check maximum number on email load part.
      if (!StringLengthRange(64, 1, str)) return false;

      // fetch each double quotes content and check the content
      let doubleQuoteSections = [
        ...str.matchAll(_emailLocalRegex.doubleQuoteReplace),
      ].map((sec) => {
        let str = sec[0];
        return str.slice(1, str.length - 1);
      });

      // check every content between the double quotes are valid.
      if (
        !doubleQuoteSections.every((section) => {
          return doubleQuoteContentChecker(section);
        })
      )
        return false;

      // check dot is valid between double quotes and other non double quotes section.
      let doubleQuoteContentRemove = str.replace(
        RegExp(_emailLocalRegex.doubleQuoteReplace, 'g'),
        '""'
      );

      // check comment
      if (!checkRegexp(_emailLocalRegex.commentCheck, doubleQuoteContentRemove))
        return false;
      doubleQuoteContentRemove = doubleQuoteContentRemove.replace(
        RegExp(_emailLocalRegex.commentReplace, 'g'),
        ''
      );

      if (
        !checkRegexp(
          _emailLocalRegex.doubleQuoteDotCheck,
          doubleQuoteContentRemove
        )
      )
        return false;

      // remove double quotes section
      str = str.replace(
        setRegexp(_emailLocalRegex.doubleQuoteReplace, 'g'),
        'dQ'
      );

      // remove comment section
      str = str.replace(RegExp(_emailLocalRegex.commentReplace, 'g'), '');

      // check dot is valid between non Double quotes.
      str = str.replace(
        setRegexp(_emailLocalRegex.nonDoubleQuotesReplace, 'g'),
        'n'
      );
      return checkRegexp(_emailLocalRegex.dotCheck, str);
    };

    var Email = function (str) {
      if (!NonEmptyString(str)) return false;

      if (str.indexOf('@') == -1) return false;
      // check if only one at sign except outside of double quote.
      let ignoreDoubleQuoteStr = str.replace(
        setRegexp(_emailLocalRegex.doubleQuoteReplace, 'g'),
        ''
      );

      // if had two or more double quote pairs in at sign, it also remains two part.
      if (ignoreDoubleQuoteStr.split('@').length != 2) return false;

      let atSignLoc = str.lastIndexOf('@');

      // The last of At sign shouldn't be at the first or the last location.
      if (atSignLoc <= 0 || atSignLoc >= str.length - 1) return false;

      let localPart = str.slice(0, atSignLoc),
        domainPart = str.slice(atSignLoc + 1);

      return EmailLocalPart(localPart) && DomainName(domainPart);
    };
  }

  // RFC 1035(Domain Name)
  {
    var DomainName = function (str) {
      let dotSplit = str.split('.');
      return (
        StringLengthRange(253, 2, str) &&
        (dotSplit.length == 1 // only hostname
          ? HostName(dotSplit[0])
          : dotSplit.every((label, index, array) => {
              return (
                Label(label) &&
                (index + 1 == array.length ? ContainAlphabet(label) : true)
              );
            }))
      );
    };

    var HostName = function (str) {
      return Label(str);
    };

    var Label = function (str) {
      let labelRegex = `
                ^                       // Start
                    [
                        a-zA-Z                  // uppercase and lowercase latin letters(RFC 952)
                        0-9                     // digits(RFC1123 allow)
                    ]
                    +
                    (?:                     // Group-Non-Capture
                        [
                            -                       // dash
                        ]
                        {1,}                        // one or more times
                        [
                            a-zA-Z                  // uppercase and lowercase latin letters
                            0-9                     // digits
                        ]
                        +                       // zero or more times
                    )                       // Group-End
                    *                       // zero or more times
                $                       // End
            `;
      labelRegex = removeComment(labelRegex);
      labelRegex = trimRegex(labelRegex);
      return StringLengthRange(63, 1, str) && checkRegexp(labelRegex, str);
    };

    var hostname = (str, required) => {
      return (
        /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/.test(
          str
        ) ||
        (!required && str.trim() === '')
      );
    };
  }

  // DateTime
  {
    // TODO: need a better rule
    /* 
      current use format in system
        Fri Jun 10 02:22:19 2022
        2022/6/9
        2022/06/09
        2022-06-09
    */
    var DateTimeIso = function (str) {
      if (!checkRegexp(/^\d{4}[/-]\d{1,2}[/-]\d{1,2}$/g, str)) return false;
      return !isNaN(Date.parse(str));
    };
    var DateRule = function (str) {
      if (!checkRegexp(/^\d{4}[/-]\d{1,2}[/-]\d{1,2}$/g, str)) return false;
      return !isNaN(Date.parse(str));
    };
    var DateTime = function (str) {
      if (
        !checkRegexp(
          /^\d{4}[/-]\d{1,2}[/-]\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}$/g,
          str
        )
      )
        return false;
      return !isNaN(Date.parse(str));
    };
    /*
    console.log('created', Validator.DateRule('2022-01-12')); // true
    console.log('created', Validator.DateRule('2022-01-31')); // true
    console.log('created', Validator.DateRule('2022-12-12')); // true
    console.log('created', Validator.DateRule('2022-13-12')); // false
    console.log('created', Validator.DateRule('2022-00-12')); // false
    console.log('created', Validator.DateRule('2022-02-29')); // false
    console.log('created', Validator.DateRule('2022-02-30')); // false
    console.log('created', Validator.DateRule('2022-02-21 00:00')); // false
    console.log('created', Validator.DateRule('2022-02-21 00:00:00')); // false

    console.log('created', Validator.DateRule('2022/01/12')); // true
    console.log('created', Validator.DateRule('2022/01/31')); // true
    console.log('created', Validator.DateRule('2022/12/12')); // true
    console.log('created', Validator.DateRule('2022/13/12')); // false
    console.log('created', Validator.DateRule('2022/00/12')); // true (X)
    console.log('created', Validator.DateRule('2022/02/29')); // true (X)
    console.log('created', Validator.DateRule('2022/02/30')); // true (X)
    console.log('created', Validator.DateRule('2022/02/21 00:00')); // false
    console.log('created', Validator.DateRule('2022/02/21 00:00:00')); // false
    */
  }

  // Authentication
  {
    // LDAP
    var DistinguishedName = function (str) {
      var array = str.split(/\s*,\s*(\w+\s*=\s*)/);
      var arr = array[0].split(/\s*(\w{2}\s*=\s*)/);
      var names = array.concat(arr).filter(function (value) {
        return value != '';
      });
      names.shift();
      let result = true;
      names.forEach(function (name, index) {
        let res = checkRegexp(/^\b(cn|ou|dc)\b=$/, name);
        if (index % 2 != 0) {
          res =
            name.search(/(,|'|#|\+|<|>|;|"|=)/) != -1 &&
            name.search(/\\(,|'|#|\+|<|>|;|"|=)/) == -1
              ? false
              : true;
        }
        if (!res) result = false;
      });
      return result;
    };

    // Role Group
    var LDAP_ROLE_Group = function (str) {
      return StringType(str) && checkRegexp(/%s/, str);
    };

    var AD_Role_Group = function (str) {
      return StringType(str) && checkRegexp(/^\w+\\\w+$/, str);
    };
  }

  // Network
  {
    // IPv4
    {
      var _classIPv4AddressRegExp = {
        private: [
          /*
                        10.0.0.0/8
                    */
          /^(010|10)\.((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){2}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
          /*
                        172.16.0.0/12
                        192.168.0.0/16
                    */
          /^(172\.16\.|192\.168\.)((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.)(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
        ],
        preserve: [
          /*
                        224.0.0.0/4
                        240.0.0.0/4
                        0.0.0.0/8
                        127.0.0.0/8
                    */
          /^([0]{1,3}|127|224|240)\.((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){2}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
          /*
                        100.64.0.0/10
                        198.18.0.0/15
                        169.254.0.0/16
                    */
          /^(100\.64\.|198\.18\.|169\.254\.)((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.)(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
          /*
                        192.0.0.0/24
                        192.0.2.0/24
                        192.88.99.0/24
                        198.51.100.0/24
                        203.0.113.0/24
                    */
          /^(192\.(0\.(0\.|2\.|113\.)|88\.99\.)|203\.0\.113\.)(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
          // 255.255.255.255/32
          /^(255\.){3}255$/,
          /*
                        10.0.0.0
                        172.16.0.0
                        192.168.0.0
                    */
          /^((010|10)\.0\.|172\.16\.|192\.168\.)0\.0$/,
        ],
      };

      var IPV4Preserved = function (str) {
        if (!StringType(str)) return false;
        let result = true,
          count = 0;
        let preserveRegExp = _classIPv4AddressRegExp.preserve;
        while (result && count < preserveRegExp.length) {
          result = !checkRegexp(preserveRegExp[count], str);
          count++;
        }
        return !result;
      };

      var IPV4Private = function (str) {
        if (!StringType(str)) return false;
        let result = true,
          count = 0;
        let privateRegExp = _classIPv4AddressRegExp.private;
        while (result && count < privateRegExp.length) {
          result = !checkRegexp(privateRegExp[count], str);
          count++;
        }
        return !result;
      };

      //var IPv4ZeroField = function (str) {
      //  return checkRegexp(/^[0]{1,3}$/, str);
      //};

      var IPV4Field = function (str) {
        return checkRegexp(/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/, str);
      };

      var IPV4CIDR = function (str) {
        return checkRegexp(/^(\d|[1-2]\d|3[0-2])$/, str);
      };

      var IPV4Format = function (str) {
        let strArray = str.split('/');
        return Range(1, 2, strArray.length);
      };

      var IPV4AddressFormat = function (str) {
        if (!IPV4Format(str)) return false;
        let ipv4Parts = str.replace(/\/.*/, '').split('.');
        if (ipv4Parts.length != 4) return false;
        return ipv4Parts.every(
          (ipField) => NonEmptyString(ipField) && IPV4Field(ipField)
        );
      };

      var IPV4CIDRPrefixFormat = function (str) {
        return IPV4Format(str) && IPV4CIDR(str.replace(/^.*\//, '').trim());
      };

      var IPV4Compare = function (ip1, ip2) {
        return IPV4Wide(ip1) && IPV4Wide(ip2) && StringCompare(ip1, ip2);
      };

      // IPV4Wide means ipv4 address includes preserved address.
      var IPV4Wide = function (str) {
        if (!StringType(str)) return false;
        if (String.prototype.indexOf.call(str, '/') != -1) return false;
        return IPV4AddressFormat(str);
      };

      // IPV4Wide/SubnetMask
      var IPV4WideWithCIDR = function (str) {
        if (!StringType(str)) return false;
        return IPV4AddressFormat(str) && IPV4CIDRPrefixFormat(str);
      };

      // IPV4 means ipv4 address doesn't include preserved address.
      var IPV4 = function (str) {
        return IPV4Wide(str) && !IPV4Preserved(str);
      };

      // IPV4/SubnetMask
      var IPV4WithCIDR = function (str) {
        if (!StringType(str)) return false;
        let strArray = str.split('/');
        let ipv4 = strArray[0];
        let cidrnum = strArray[1];
        return (
          IPV4WideWithCIDR(str) &&
          !IPV4Preserved(ipv4) &&
          !IPV4NetworkID(ipv4, cidrnum) &&
          !IPV4Broadcast(ipv4, cidrnum)
        );
      };

      var IPV4SubnetMask = function (str) {
        if (!StringType(str)) return false;
        let subnetMask = str.split('.');
        if (
          subnetMask.length != 4 ||
          !subnetMask.every((mask) => mask.length > 0)
        )
          return false;
        subnetMask = subnetMask.map(Number);
        if (!subnetMask.every((mask) => mask < 256)) return false;
        // padStart function is not supported on IE11
        subnetMask = subnetMask
          .map((mask) => mask.toString(2).padStart(8, '0'))
          .join('');
        let index0 = subnetMask.indexOf('0');
        if (index0 == -1) return true;
        return subnetMask.indexOf('1', index0) == -1;
      };

      var IPV4NetworkID = function (str, cidr) {
        if (!StringType(str)) return false;
        if (!IPV4Format(str)) return false;
        cidr = cidr || -1;

        let strArray = str.split('/');
        let ipv4 = strArray[0];
        let cidrFromStr = strArray[1];

        // check cidr
        let cidrResult = IPV4CIDR(cidr)
          ? parseInt(cidr, 10)
          : IPV4CIDR(cidrFromStr)
          ? parseInt(cidrFromStr, 10)
          : undefined;
        if (!Defined(cidrResult)) return false;

        // generate NetworkID
        return IPV4Compare(ipv4, Converter.ipv4GetNetworkId(ipv4, cidrResult));
      };

      var IPV4Broadcast = function (str, cidr) {
        if (!StringType(str)) return false;
        if (!IPV4Format(str)) return false;
        cidr = cidr || -1;

        let strArray = str.split('/');
        let ipv4 = strArray[0];
        let cidrFromStr = strArray[1];

        // check cidr
        let cidrResult = IPV4CIDR(cidr)
          ? parseInt(cidr, 10)
          : IPV4CIDR(cidrFromStr)
          ? parseInt(cidrFromStr, 10)
          : undefined;
        if (!Defined(cidrResult)) return false;

        // generate Broadcast Address
        return IPV4Compare(ipv4, Converter.ipv4GetBroadcast(ipv4, cidrResult));
      };

      var ipv4 = (str, required) => {
        return (
          /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(
            str
          ) ||
          (!required && str.trim() == '')
        );
      };

      var ipv4Subnet = (str, required) => {
        var cidr = str.split('/')[1];
        if (cidr != undefined) {
          cidr = parseInt(cidr);
          if (isNaN(cidr)) {
            return false;
          }
          if (cidr < 0 || cidr > 32) {
            return false;
          }
        }
        str = str.split('/')[0];
        return ipv4(str, required);
      };

      var IPV4NonZero = function (str) {
        return !checkRegexp(/^([0].){3}[0]$/, str);
      };
    }

    // IPv6
    {
      var _ipv6AcceptAddressRegex = [
        /*

                */
        /^(?:[0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}$/,
        /*

                */
        /^(?:[0-9a-fA-F]{1,4}:){1,7}:$/,
        /*

                */
        /^(?:[0-9a-fA-F]{1,4}:){1,6}(?::[0-9a-fA-F]{1,4}){1,1}$/,
        /*

                */
        /^(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}$/,
        /*

                */
        /^(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}$/,
        /*

                */
        /^(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}$/,
        /*

                */
        /^(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}$/,
        /*

                */
        /^(?:[0-9a-fA-F]{1,4}:){1,1}(?::[0-9a-fA-F]{1,4}){1,6}$/,
        /*

                */
        /^:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:)$/,
        /*

                */
        /^fe80:(?::[0-9a-fA-F]{0,4}){0,4}$/,
        /*

                */
        // /^fe80:(?::[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}$/,
        /*

                */
        /^::(?:ffff(?::0{1,4}){0,1}:){0,1}(?:(?:2(?:5[0-5]|[0-4][0-9])|1[0-9]{2,2}|0?[0-9]{0,2})\.){3,3}(?:2(?:5[0-5]|[0-4][0-9])|1[0-9]{2,2}|0?[0-9]{0,2})$/,
        /*

                */
        /^(?:[0-9a-fA-F]{1,4}:){1,5}:(?:(?:2(?:5[0-5]|[0-4][0-9])|1[0-9]{2,2}|0?[0-9]{0,2})\.){3,3}(?:2(?:5[0-5]|[0-4][0-9])|1[0-9]{2,2}|0?[0-9]{0,2})$/,
        /*

                */
        /^(?:[0-9a-fA-F]{1,4}:){1,6}(?:(?:2(?:5[0-5]|[0-4][0-9])|1[0-9]{2,2}|0?[0-9]{0,2})\.){3,3}(?:2(?:5[0-5]|[0-4][0-9])|1[0-9]{2,2}|0?[0-9]{0,2})$/,
      ];

      // _ipv6AcceptAddressRegex = _ipv6AcceptAddressRegex.map(addressRegex => {
      //     return trimRegex(removeComment(addressRegex));
      // });

      var IPV6Address = function (str) {
        let result = false,
          count = 0;
        while (!result && count < _ipv6AcceptAddressRegex.length) {
          result = checkRegexp(_ipv6AcceptAddressRegex[count], str);
          count++;
        }
        return result;
      };

      var IPV6CIDR = function (str) {
        return checkRegexp(/^(\d|\d\d|1[0-2][0-8])$/, str);
      };

      var IPV6Format = function (str) {
        let strArray = str.split('/');
        return Range(1, 2, strArray.length);
      };

      var IPV6AddressFormat = function (str) {
        if (!IPV6Format(str)) return false;
        return IPV6Format(str) && IPV6Address(str.replace(/\/.*/, ''));
      };

      var IPV6CIDRPrefixFormat = function (str) {
        return IPV6Format(str) && IPV6CIDR(str.replace(/^.*\//, '').trim());
      };

      // IPV6Wide means ipv6 address includes preserved address.
      var IPV6Wide = function (str) {
        if (!StringType(str)) return false;
        if (String.prototype.indexOf.call(str, '/') != -1) return false;
        return IPV6AddressFormat(str);
      };

      var IPV6WideWithCIDR = function (str) {
        if (!StringType(str)) return false;
        return IPV6AddressFormat(str) && IPV6CIDRPrefixFormat(str);
      };

      // IPV6 means ipv6 address doesn't include preserved address.
      var IPV6 = function (str) {
        return IPV6Wide(str) && !IPV6Preserved(str);
      };

      var IPV6WithCIDR = function (str) {
        if (!StringType(str)) return false;
        let strArray = str.split('/');
        let ipv6 = strArray[0];
        return IPV6WideWithCIDR(str) && !IPV6Preserved(ipv6);
      };

      var ipv6 = (str, required) => {
        return (
          /^(?:(?:[0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}(?::[0-9a-fA-F]{1,4}){1,1}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|(?:[0-9a-fA-F]{1,4}:){1,1}(?::[0-9a-fA-F]{1,4}){1,6}|:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(?::[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(?:ffff(?::0{1,4}){0,1}:){0,1}(?:(?:2(?:5[0-5]|[0-4][0-9])|1[0-9]{2,2}|0?[0-9]{0,2})\.){3,3}(?:2(?:5[0-5]|[0-4][0-9])|1[0-9]{2,2}|0?[0-9]{0,2})|(?:[0-9a-fA-F]{1,4}:){1,4}:(?:(?:2(?:5[0-5]|[0-4][0-9])|1[0-9]{2,2}|0?[0-9]{0,2})\.){3,3}(?:2(?:5[0-5]|[0-4][0-9])|1[0-9]{2,2}|0?[0-9]{0,2}))$/i.test(
            str
          ) ||
          (!required && str.trim() == '')
        );
      };

      var ipv6Subnet = (str) => {
        return /^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*(\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$/.test(
          str
        );
      };

      var _preserveIPv6AddressRegExp = [
        /*
                    ::/128
                    ::1/128
                */
        /^(?:::|(?:0{1,4}:){7}0{0,3}[01]|(?:0{1,4}:){1,6}:0{0,3}[01]?|(?:0{1,4}:){1,5}(?::0{1,4}){0,1}:0{0,3}[01]|(?:0{1,4}:){1,4}(?::0{1,4}){0,2}:0{0,3}[01]|(?:0{1,4}:){1,3}(?::0{1,4}){0,3}:0{0,3}[01]|(?:0{1,4}:){1,2}(?::0{1,4}){0,4}:0{0,3}[01]|(?:0{1,4}:){1}(?::0{1,4}){0,5}:0{0,3}[01]|:(?::0{1,4}){0,6}:0{0,3}[01])$/,
        /*
                    64:ff9b::/96

                    64:ff9b:0000:0000:0000:0000:xxxx:xxxx

                    64:ff9b::xxxx:xxxx
                    64:ff9b::0000:xxxx:xxxx
                    64:ff9b::0000:0000:xxxx:xxxx
                    64:ff9b::0000:0000:0000:xxxx:xxxx

                    64:ff9b:0000::xxxx:xxxx
                    64:ff9b:0000::0000:xxxx:xxxx
                    64:ff9b:0000::0000:0000:xxxx:xxxx

                    64:ff9b:0000:0000::xxxx:xxxx
                    64:ff9b:0000:0000::0000:xxxx:xxxx
                */
        /^0{0,2}64:[Ff]{2}9[bB](?:(?::0{1,4}){4}:|:(?::0{1,4}){0,3}:|:(?:0{1,4}:){1}(?::0{1,4}){0,2}:|:(?:0{1,4}:){2}(?::0{1,4}){0,1}:)/,
        /*
                    100::/64

                    100:0000:0000:0000:

                    100::xxxx:xxxx:xxxx:xxxx
                    100::0000:xxxx:xxxx:xxxx:xxxx
                    100::0000:0000:xxxx:xxxx:xxxx:xxxx

                    100:0000::xxxx:xxxx:xxxx:xxxx
                    100:0000::0000:xxxx:xxxx:xxxx:xxxx

                    100:0000:0000::xxxx:xxxx:xxxx:xxxx
                */
        /^1000?(?:(?::0{1,4}){3}:|:(?::0{1,4}){0,2}:|:(?:0{1,4}:){1}(?::0{1,4}){0,1}:|:(?:0{1,4}:){2}:)/,
        /*
                    2001::/32
                    2001:db8::/32

                    2001:db8:~
                    2001:0db8:~
                    2001:0:~
                    2001:00:~
                    2001:000:~
                    2001:0000:~
                */
        /^2001:(?:0{0,4}|0?[dD][bB]8):/,
        /*
                    2001:10::/28
                    2001:20::/28

                    2001:10:~
                    2001:010:~
                    2001:0010:~
                    2001:20:~
                    2001:020:~
                    2001:0020:~
                */
        /^2001:0{0,2}[12]0:/,
        /*
                    2002::/16

                    2002:~
                */
        /^2002:/,
        /*
                    fe80::/10

                    fe8~
                    fe9~
                    fea~
                    feb~
                */
        /^[fF][eE][89aAbB][0-9a-fA-F]:/,
        /*
                    ff00::/8

                    ff~
                */
        /^[fF][fF][0-9a-fA-F]{2}:/,
      ];

      var IPV6Preserved = function (str) {
        let result = true,
          count = 0;
        while (result && count < _preserveIPv6AddressRegExp.length) {
          result = !checkRegexp(_preserveIPv6AddressRegExp[count], str);
          count++;
        }
        return !result;
      };
    }

    // Mac
    {
      var MACField = function (str) {
        return checkRegexp(/^([0-9A-Fa-f]{2})$/, str);
      };

      var macField = (str, required) => {
        return (
          /^([0-9A-Fa-f]{2})$/.test(str) && (!required || str.trim() !== '')
        );
      };

      var MAC = function (str) {
        let macPart = str.replace(/:/g, '-').split('-');
        if (macPart.length != 6) return false;
        return macPart.every(
          (macfield) => NonEmptyString(macfield) && MACField(macfield)
        );
      };
    }
  }

  // SNMP
  {
    // SNMP Trap
    {
      var commString = function (str) {
        return checkRegexp(/^\w{1,18}$/g, str);
      };
      var userName = function (str) {
        return checkRegexp(/^[a-z0-9_-_.]{1,10}$/g, str);
      };
      //var authPass = function (str) {
      //  return checkRegexp(/^[\x00-\x7F]{1,12}$/, str);
      //};
      //var privPass = function (str) {
      //  return checkRegexp(/^[\x00-\x7F]{1,12}$/, str);
      //};
    }
  }

  // Percent
  {
    var Percent = function (str) {
      return StringType(str) && checkRegexp(/^[+-]*[\d]+%$/, str);
    };
  }

  // Color
  {
    var HexColor = function (str) {
      return StringType(str) && checkRegexp(/^#(?:[0-9A-Fa-f]{3}){1,2}$/, str);
    };

    var RGBAColor = function (str) {
      return (
        StringType(str) &&
        checkRegexp(
          /^rgba\((?:\s*[0-9]{1,3}\s*,){3}(?:\s*(\.[1-9]+|0|1)\s*)\)$/,
          str
        )
      );
    };
  }

  // Bios
  {
    var DevicePath = function (str) {
      let deviceLabelRegex = `
                ^                       // Start
                    (?:                     // Group-Non-Capture
                        [
                            a-zA-Z                  // uppercase and lowercase latin letters
                            0-9                     // digits
                        ]
                        +                       // zero or more times
                    )                       // Group-End
                    (?:                     // Group-Non-Capture
                        \\(                    // (
                            (?:                     // Group-Non-Capture
                                [
                                    a-zA-Z                  // uppercase and lowercase latin letters
                                    0-9                     // digits
                                ]
                                +                       // one or more times
                            )                   // Group-End
                            (?:                 // Group-Non-Capture
                                ,                  // ,
                                (?:                     // Group-Non-Capture
                                    [
                                        a-zA-Z                  // uppercase and lowercase latin letters
                                        0-9                     // digits
                                    ]
                                )                       // Group-End
                                +                       // one or more times
                            )                       // Group-End
                            *                       // zero or more times
                        \\)                    // )
                    )                       // Group-End
                $                       // End
            `;
      deviceLabelRegex = removeComment(deviceLabelRegex);
      deviceLabelRegex = trimRegex(deviceLabelRegex);
      let devicePaths = str.split('/');

      return devicePaths.every(function (deviceLabel) {
        return checkRegexp(deviceLabelRegex, deviceLabel);
      });
    };
  }
}

// KeyBoard
{
  var Window_Key = function (str) {
    let WinKey = ['WIN', 'LWIN', 'RWIN'];
    return StringType(str) && hasInArray(WinKey, str.toUpperCase());
  };

  var Control_Shift_ALT_Key = function (str) {
    let CtrlShiftAltKey = [
      'CTRL',
      'LCTRL',
      'RCTRL', //ctrl
      'SHIFT',
      'LSHIFT',
      'RSHIFT', //shift
      'ALT',
      'LALT',
      'RALT',
      'ALTGR', //alt
    ];
    return StringType(str) && hasInArray(CtrlShiftAltKey, str.toUpperCase());
  };

  var Function_Key = function (str) {
    let FnKey = [
      'ENTER',
      'ESC',
      'F1',
      'F2',
      'F3',
      'F4',
      'F5',
      'F6',
      'F7',
      'F8',
      'F9',
      'F10',
      'F11',
      'F12',
      'BKSP',
      'TAB',
      'CAPSLK',
      'SPACE',
      'INS',
      'DEL',
      'HOME',
      'END',
      'PGUP',
      'PGDN',
      'CONTEXT',
      'MENU',
      'UP',
      'LEFT',
      'DOWN',
      'RIGHT',
      'NUMLK',
      'NP_DIV',
      'NP_MULT',
      'NP_MINUS',
      'NP_PLUS',
      'NP_0',
      'NP_1',
      'NP_2',
      'NP_3',
      'NP_4',
      'NP_5',
      'NP_6',
      'NP_7',
      'NP_8',
      'NP_9',
      'NP_DEC',
      'NP_ENTER',
      'PRTSC',
      'SYSRQ',
      'SCRLK',
      'PAUSE',
      'BREAK',
    ];
    return StringType(str) && hasInArray(FnKey, str.toUpperCase());
  };

  var KeyMacro = function (str) {
    if (EmptyString(str)) return true; // no data is valid
    let regexp = /^[a-z0-9,.;[\]`=/'\\-]$/i; // ', without ~!@#$%^&*()_+|<>?:""
    let keyTable = [];
    //let result = false,
    //keyUnknownCnt = 0,
    let keySpecialCnt = 0;
    let keyNormalCnt = 0;
    //duplicateKey = false;
    return str.split('+').every(function (key) {
      key = key.replace(/ /g, '');

      // duplicate Key found
      if (keyTable.indexOf(key) != -1) return false;

      keyTable.push(key);
      if (Window_Key(key)) {
        // if key is Win key
        keySpecialCnt++;
      } else if (Control_Shift_ALT_Key(key)) {
        keySpecialCnt++;
      } else if (Function_Key(key)) {
        // if key is Fn key
        keyNormalCnt++;
      } else if (checkRegexp(regexp, key)) {
        // if key is normal key and only 1 character
        keyNormalCnt++;
      } else {
        return false; // key is unknown
      }
      return keyNormalCnt <= 1 && keySpecialCnt <= 3;
    });
  };

  var KeyMacroName = function (str) {
    return (
      EmptyString(str) || // no data is valid
      checkRegexp(/^[a-z0-9,.;[\]`=/'\\\-~!@#$%^&*()_+|<>?:" ]+$/i, str.trim())
    );
  };
}

// File
{
  var SystemPath = function (str) {
    if (str[0] == '/') {
      return checkRegexp(/^\/[^<>:"|?*]+$/, str);
    } else if (str[0] == '\\') {
      return checkRegexp(/^\\[^<>:"|?*]+$/, str);
    }
    return false;
  };

  var Path = function (str) {
    return checkRegexp(
      /^\\[a-zA-Z0-9_$.\- ]+\\([a-zA-Z0-9_$.\- ]+\\*)+(\.[iI][sS][oO]){1}$/,
      str
    );
  };

  var FileExtMatch = function (extname, str) {
    let str_ext = str.slice(extname.length * -1);
    // console.log(extname, str, str_ext, str_ext===extname, "in FileExtMatch");
    return StringCompare(extname, str_ext);
  };
}

// Size
{
  var ContainSizeStr_SI = function (str) {
    return checkRegexp(/^(\d)+(K|M|G|T|P|E|Z|Y){1}B$/, str);
  };

  var ContainSizeStr_IEC60027_2 = function (str) {
    return checkRegexp(/^(\d)+(K|M|G|T|P|E|Z|Y){1}iB$/, str);
  };
}

// Condition
{
  var AllPass = function () {
    let conditions = Array.prototype.slice.call(arguments);
    return conditions.every(function (condition) {
      return condition;
    });
  };

  var ParitialPass = function (num) {
    let conditions = Array.prototype.slice.call(arguments, 1);
    let currPass = 0;
    num = num > conditions.length ? conditions.length : num;
    return conditions.some(function (condition) {
      currPass += condition ? 1 : 0;
      return currPass >= num ? true : false;
    });
  };

  var AllFail = function () {
    let conditions = Array.prototype.slice.call(arguments);
    return conditions.every(function (condition) {
      return !condition;
    });
  };

  var ParitialFail = function (num) {
    let conditions = Array.prototype.slice.call(arguments, 1);
    let currFail = 0;
    num = num > conditions.length ? conditions.length : num;
    return conditions.some(function (condition) {
      currFail += !condition ? 1 : 0;
      return currFail >= num ? true : false;
    });
  };
}

export default {
  // Type
  Defined: Defined,
  NullType: NullType,
  NumberType: NumberType,
  BooleanType: BooleanType,
  StringType: StringType,
  ObjectType: ObjectType,
  FunctionType: FunctionType,
  ArrayType: ArrayType,
  PromiseType: PromiseType,
  ElementType: ElementType,

  // Array
  HasInArray: hasInArray,

  // Object
  NoopObject: NoopObject,

  // String
  Length: Length,
  EmptyString: EmptyString,
  NonEmptyString: NonEmptyString,
  StringLengthRange: StringLengthRange,
  LowerCase: LowerCase,
  UpperCase: UpperCase,
  LetterCode: LetterCode,
  Alphabet: Alphabet,
  PrintableChar: PrintableChar,
  NOTWhiteSpacePrintableChar: NOTWhiteSpacePrintableChar,
  ContainLowerCase: ContainLowerCase,
  ContainUpperCase: ContainUpperCase,
  ContainAlphabet: ContainAlphabet,
  ContainIncreasingAlphabet: ContainIncreasingAlphabet,
  ContainContinuousAlphabet: ContainContinuousAlphabet,
  ContainDuplicateAlphabet: ContainDuplicateAlphabet,
  StringRule: StringRule,
  NonSpecialChar: NonSpecialChar,
  ContainSpecialChar: ContainSpecialChar,
  ContainSpecificChar: ContainSpecificChar,

  // Number
  NumberRule: NumberRule,
  HexRule: HexRule,
  NonZeroNumberRule: NonZeroNumberRule,
  ContainNumber: ContainNumber,
  ContainIncreasingNumber: ContainIncreasingNumber,
  ContainContinuousNumber: ContainContinuousNumber,
  Less: Less,
  More: More,
  Less_Equal: Less_Equal,
  More_Equal: More_Equal,
  Equal: Equal,
  Range: Range,
  Range_Strict: Range_Strict,
  Static_Number: Static_Number,

  // DateTime
  DateTimeIso,
  DateRule,
  DateTime,

  // Authentication
  DistinguishedName: DistinguishedName,
  LDAP_ROLE_Group: LDAP_ROLE_Group,
  AD_Role_Group: AD_Role_Group,

  // Function
  Email: Email,
  UserName: UserName,
  UserName_Strict: UserName_Strict,
  UserNameSamba: UserNameSamba,
  Password: Password,
  DomainName: DomainName,
  HostName: HostName,
  hostname: hostname,

  // Network
  //TODO: compatiable IP
  // IPV4
  IPV4: IPV4,
  IPV4WithCIDR: IPV4WithCIDR,
  IPV4Wide: IPV4Wide,
  IPV4WideWithCIDR: IPV4WideWithCIDR,
  IPV4SubnetMask: IPV4SubnetMask,
  IPV4Preserved: IPV4Preserved,
  IPV4Private: IPV4Private,
  IPV4NetworkID: IPV4NetworkID,
  IPV4Broadcast: IPV4Broadcast,
  ipv4: ipv4,
  ipv4Subnet: ipv4Subnet,
  // IPV6
  IPV6: IPV6,
  IPV6WithCIDR: IPV6WithCIDR,
  IPV6Wide: IPV6Wide,
  IPV6WideWithCIDR: IPV6WideWithCIDR,
  IPV6Preserved: IPV6Preserved,
  ipv6: ipv6,
  ipv6Subnet: ipv6Subnet,
  IPV4NonZero: IPV4NonZero,
  MAC: MAC,
  MACField: MACField,
  macField: macField,

  // Bios
  DevicePath: DevicePath,

  // SNMP trap
  commString: commString,
  userName: userName,
  //authPass: authPass,
  //privPass: privPass,

  // Percent
  Percent: Percent,

  // Color
  HexColor: HexColor,
  RGBAColor: RGBAColor,

  // KeyBoard
  KeyMacro: KeyMacro,
  KeyMacroName: KeyMacroName,

  // File
  SystemPath,
  Path: Path,
  FileExtMatch: FileExtMatch,

  // Size
  ContainSizeStr_SI: ContainSizeStr_SI,
  ContainSizeStr_IEC60027_2: ContainSizeStr_IEC60027_2,

  // Condition
  AllPass: AllPass,
  ParitialPass: ParitialPass,
  AllFail: AllFail,
  ParitialFail: ParitialFail,
};
