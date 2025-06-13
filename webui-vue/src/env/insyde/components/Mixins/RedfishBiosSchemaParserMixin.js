import { OemAttributeParser } from './RedfishBiosSchemaOemParserMixin';

const biosMap = {};
const RedfishBiosSchemaParserMixin = {
  data() {
    return {
      base: null,
      baseRule: `^./[^/]+$`,
    };
  },
  computed: {
    baseMenus() {
      const vm = this;
      return vm.registryMenus
        .filter((menu) => RegExp(vm.baseRule).test(menu.MenuPath))
        .map((n) => {
          return {
            displayName: n?.DisplayName,
            path: n?.MenuPath,
          };
        });
    },
    menus() {
      const vm = this;
      return vm.registryMenus
        .filter((menu) => menu.MenuPath.indexOf(vm.base) == 0)
        .map((menu) => menuNode(menu));
    },
    attributesMap() {
      return this.registryAttributes.reduce((obj, currAttr) => {
        obj[currAttr.AttributeName] = currAttr;
        return obj;
      }, {});
    },
    attributes() {
      const vm = this;
      return vm.registryAttributes
        .filter(
          (attr) => attr?.DisplayName.replace(/ /g, '').length > 0 ?? false
        )
        .map((attr) => attrNode(attr, vm.values, vm.getAttributesMap));
    },
    dependencies() {
      if (process.env.VUE_APP_OPF5_RELEASE_PATCHES) {
        return this.registryDependencies.map((dep) => dep.Dependency ?? {});
      } else {
        return this.registryDependencies
          .map((dep) => dep.Dependency ?? {})
          .filter(
            (dep) =>
              dep.MapToAttribute in this.nodeMap &&
              dep.MapFrom.every((from) => from.MapFromAttribute in this.nodeMap)
          );
      }
    },
    variables() {
      const vm = this;
      return vm.registryAttributes
        .filter((attr) => attr.DisplayName === ' ')
        .map((attr) => attrNode(attr, vm.values, vm.getAttributesMap));
    },
    nodeMap() {
      const mapFunc = (obj) =>
        obj.reduce((obj, node) => {
          obj[node.name] = node;
          return obj;
        }, {});
      Object.assign(
        biosMap,
        mapFunc(this.menus),
        mapFunc(this.attributes),
        mapFunc(this.variables)
      );
      return biosMap;
    },
  },
  methods: {
    setBase(base) {
      this.base = base
        ? this.baseMenus.find((navi) => navi.displayName === base)?.path
        : '.';
    },
    buildTree: function (base, values) {
      this.setBase(base);
      runDependencies(this.dependencies, values);
      return tree(
        this.base,
        this.menus,
        this.attributes,
        this.variables,
        values
      );
    },
    syncTree: function (attr, values) {
      runDependencies(filterDependencies(this.dependencies, attr), values);
    },
  },
};

const getTargetFromMap = (name) => biosMap[name];

const filterDependencies = (totalDeps, attr) => {
  // add order for each dependency.
  const deps = totalDeps.map((dep, index) => (dep.order = index));
  // filter the dependency that the dependency's mapfrom is equal to attr.name.
  const depOnMapFromMappingAttrName = deps.filter(
    (dep) =>
      dep.MapFrom?.once((from) => from.MapFromAttribute === attr) ?? false
  );
  // find the all mapTo possibility.
  const targetOnMapTo = depOnMapFromMappingAttrName.reduce((targets, dep) => {
    if (!(dep.MapToAttribute in targets)) targets[dep.MapToAttribute] = {};
    if (!(dep.MapToProperty in targets[dep.MapToAttribute]))
      targets[dep.MapToAttribute][dep.MapToProperty] = [];
    if (
      targets[dep.MapToAttribute][dep.MapToProperty].indexOf(
        (val) => val === dep.MapToValue
      ) == -1
    ) {
      targets[dep.MapToAttribute][dep.MapToProperty].push(dep.MapToValue);
    }
    return targets;
  }, {});
  // filter the dependency is match the mapTo possiblity.
  const depOnMapToMappingTarget = deps.filter((dep) => {
    if (!(dep.MapToAttribute in targetOnMapTo)) return false;
    if (!(dep.MapToProperty in targetOnMapTo[dep.MapToAttribute])) return false;
    return (
      targetOnMapTo[dep.MapToAttribute][dep.MapToProperty].indexOf(
        (val) => val === dep.MapToValue
      ) != -1
    );
  });
  return depOnMapToMappingTarget.sort((a, b) => a.order > b.order);
};

const runDependencies = (deps, values) => {
  deps.forEach((dep) => {
    let result = execDependency(dep.MapFrom);
    if (result) setProperty(dep, values);
  });
};

const execDependency = (mapFroms) => {
  if (mapFroms.length <= 0) return false;
  const results = mapFroms.map(
    (mapFrom) => execCondition(mapFrom, getProperty(mapFrom)) ?? false
  );
  // single result
  if (results.length == 1) return results[0];
  // multiple result
  const operators = mapFroms
    .map((mapFrom) => mapFrom.MapTerms)
    .filter((term) => term ?? false);
  // result number doesn't match the proper operator number
  if (operators.length != results.length - 1) return false;
  return results.reduce((conclude, curr, index) => {
    if (index == 0) return conclude;
    return operatorMap[operators[index - 1]]?.(conclude, curr) ?? false;
  }, results[0]);
};

const execCondition = (rule, value) => {
  let condition = rule.MapFromCondition;
  let targetValue = rule.MapFromValue;
  return conditionMap[condition]?.(value, targetValue) ?? false;
};

const getProperty = (rule) => {
  let name = rule.MapFromAttribute;
  let property = rule.MapFromProperty;
  let target = getTargetFromMap(name) ?? undefined;
  if (!target || !(property in getPropertyMap)) return;
  return getPropertyMap[property](target);
};

const setProperty = (rule, values) => {
  let name = rule.MapToAttribute;
  let property = rule.MapToProperty;
  let value = rule.MapToValue;
  let target = getTargetFromMap(name) ?? undefined;
  if (!target || !(property in setPropertyMap)) return false;
  return setPropertyMap[property](target, value, values);
};

const conditionMap = {
  EQU: (compared, target) => compared === target,
  NEQ: (compared, target) => compared !== target,
  GEQ: (compared, target) => compared >= target,
  GTR: (compared, target) => compared > target,
  LEQ: (compared, target) => compared <= target,
  LSS: (compared, target) => compared < target,
};

const operatorMap = {
  OR: (cond1, cond2) => cond1 || cond2,
  AND: (cond1, cond2) => cond1 && cond2,
};

const getPropertyMap = {
  CurrentValue: (target) => target.value?.init,
  DefaultValue: (target) => target.value?.default,
  GrayOut: (target) => target.grayout,
  Hidden: (target) => target.hidden,
  UpperBound: (target) => target.restrict?.maxInt,
  LowerBound: (target) => target.restrict?.minInt,
  MaxLength: (target) => target.restrict?.maxLength,
  MinLength: (target) => target.restrict?.minLength,
  ReadOnly: (target) => target.readonly,
  WriteOnly: (target) => target.writeonly,
  ScalarIncrement: (target) => target.restrict?.amountInt,
};

const setPropertyMap = {
  CurrentValue: (target, value, values) => {
    if (!(target.name in values) || !target.value || !('init' in target.value))
      return false;
    target.value.init = value;
    values[target.name] = value;
    return true;
  },
  DefaultValue: (target, value) => {
    if (!target.value || !('default' in target.value)) return false;
    target.value.default = value;
    return true;
  },
  DisplayName: (target, value) => {
    if (!('display' in target)) return false;
    target.display = value;
    return true;
  },
  DisplayOrder: (target, value) => {
    if (!('order' in target)) return false;
    target.order = value;
    return true;
  },
  GrayOut: (target, value) => {
    if (!('grayout' in target)) return false;
    target.grayout = value;
    return true;
  },
  Hidden: (target, value) => {
    if (!('hidden' in target)) return false;
    target.hidden = value;
    return true;
  },
  UpperBound: (target, value) => {
    if (!target.restrict || !('maxInt' in target.restrict)) return false;
    target.restrict.maxInt = value;
    return true;
  },
  LowerBound: (target, value) => {
    if (!target.restrict || !('minInt' in target.restrict)) return false;
    target.restrict.minInt = value;
    return true;
  },
  ScalarIncrement: (target, value) => {
    if (!target.restrict || !('amountInt' in target.restrict)) return false;
    target.restrict.amountInt = value;
    return true;
  },
  MaxLength: (target, value) => {
    if (!target.restrict || !('maxLength' in target.restrict)) return false;
    target.restrict.maxLength = value;
    return true;
  },
  MinLength: (target, value) => {
    if (!target.restrict || !('minLength' in target.restrict)) return false;
    target.restrict.minLength = value;
    return true;
  },
  ReadOnly: (target, value) => {
    if (!('readonly' in target)) return false;
    target.readonly = value;
    return true;
  },
  WriteOnly: (target, value) => {
    if (!('writeonly' in target)) return false;
    target.writeonly = value;
    return true;
  },
  HelpText: (target, value) => {
    if (!target.text || !('help' in target.text)) return false;
    target.text.help = value;
    return true;
  },
  WarningText: (target, value) => {
    if (!target.text || !('warning' in target.text)) return false;
    target.text.warning = value;
    return true;
  },
  // 'Immutable':
  // 'ValueExpression':
};

// tree builder
const tree = (base, menus, attrs, vars) => {
  let root = menuNode({ MenuName: '.', MenuPath: '.' });

  // menus
  menus.forEach((menu) => searchAppendNode(root, menu).child.push(menu));
  // attributes
  attrs.forEach((attr) => searchAppendNode(root, attr).child.push(attr));
  // variables
  vars.forEach((v) => searchAppendNode(root, v).externalChild.push(v));

  return searchBase(root, base) ?? root;
};

const menuNode = (node, prev) => {
  if (
    !(node?.MenuName || prev?.MenuName) ||
    !(node?.MenuPath || prev?.MenuPath)
  )
    return;
  return {
    nodeType: 'menu',
    name: node?.MenuName ?? prev?.MenuName,
    display: node?.DisplayName ?? prev?.DisplayName ?? '',
    order: node?.DisplayOrder ?? prev?.DisplayOrder ?? 0,
    path: node?.MenuPath ?? prev?.MenuPath,
    readonly: node?.ReadOnly ?? prev?.ReadOnly ?? false,
    hidden: node?.Hidden ?? prev?.Hidden ?? false,
    grayout: node?.GrayOut ?? prev?.GrayOut ?? false,
    child: prev?.child ?? [],
    externalChild: prev?.externalChild ?? [],
  };
};

const attrNode = (node, valueMaps, attrList) => {
  if (!node?.AttributeName || !node?.MenuPath || !node?.Type) return;
  let resultNode = {
    nodeType: 'attr',
    name: node.AttributeName,
    display: node?.DisplayName ?? '',
    order: node?.DisplayOrder ?? 0,
    path: node.MenuPath,
    readonly: node?.ReadOnly ?? false,
    writeonly: node?.WriteOnly ?? false,
    hidden: node?.Hidden ?? false,
    grayout: node?.GrayOut ?? false,
    value: {
      default: node?.DefaultValue ?? node.CurrentValue ?? undefined,
      init: valueMaps?.[node.AttributeName] ?? node?.CurrentValue ?? undefined,
      // Type: ENUMERATION
      options:
        node?.Value?.filter((val) => val.ValueDisplayName && val.ValueName).map(
          (val) => {
            return {
              text: val.ValueDisplayName,
              value: val.ValueName,
            };
          }
        ) ?? [],
    },
    text: {
      help: node?.HelpText ?? '',
      warning: node?.WarningText ?? '',
    },
    type: node?.Type,
    restrict: {
      // Type: INTEGER
      minInt: node?.LowerBound ?? undefined,
      maxInt: node?.UpperBound ?? undefined,
      amountInt: node?.ScalarIncrement ?? undefined,
      // Type: STRING
      minLength: node?.MinLength ?? undefined,
      maxLength: node?.MaxLength ?? undefined,
    },
  };
  return node?.Oem
    ? OemAttributeParser(resultNode, node, valueMaps, attrList)
    : resultNode;
};

const searchBase = (node, base) => {
  if (node.path !== base) {
    if (node?.child?.length > 0)
      return node.child.find((c) => searchBase(c, base) !== undefined);
    else return undefined;
  } else return node;
};

const searchMenu = (node, paths) => {
  let target = node;
  paths.forEach((part, index, parts) => {
    if (target.name !== part) {
      let newTarget = target.child
        .filter((c) => c.nodeType === 'menu')
        .find((c) => c.name === part);
      if (!newTarget && parts.length - 1 >= index) {
        newTarget = menuNode({
          MenuName: part,
          DisplayName: part,
          DisplayOrder: target.child.length,
          MenuPath: `${target.path}/${part}`,
        });
        target.child.push(newTarget);
      }
      target = newTarget;
    }
  });
  return target;
};

const searchAppendNode = (node, child) => {
  if (node.nodeType !== 'menu' || !child) return;
  let pathSplits = child.path.split('/');
  if (child.nodeType === 'menu') pathSplits = pathSplits.slice(0, -1);
  return searchMenu(node, pathSplits);
};

export default RedfishBiosSchemaParserMixin;
