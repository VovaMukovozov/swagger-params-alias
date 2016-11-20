var debug  = require('debug')('swagger:params-alias');

/**
  fitting factory function for a fitting that whenever parameter is missing
  AND defines an alias - it wires the search for that value in that alias.
  
  @param {object} fittingDef
  @param {string|optional} fittingDef.aliasAttribute attribute name to define 
     paraameter alias. Default: x-alias
  @returns {function(ctx,cb)} The fitting
 */
module.exports = function create(fittingDef, bagpipes) {
    var ALIAS = fittingDef.aliasAttribute || 'x-alias';
    
    bagpipes.config.swaggerNodeRunner.api.getOperations().forEach(function(operation) {
        operation.parameterObjects.forEach(function(parameter) {
            var alias = parameter.definition[ALIAS];
            if (!alias)
                return debug("parameter [%s] has no alias.", parameter.name);
            
            debug("parameter [%s] defines [%s] as alias.", alias, parameter.name);
            hookGetValue(parameter, alias)
        })
    });
    
    debug('created');
    return openapi_params_alias;
    
    /* istanbul ignore next */
    function openapi_params_alias(ctx, cb) {
        debug('WARN - you don\'t really need this fitting in your pipe, it only has to be defined in your bagpipes list');
        return cb()
    }
}

/**
  replaces the implementation of `Parameter#getValue(req)` with one that tries 
  an allias if value is not found under the official name.
  @param {sway.Parameter} parameter
  @param {string} alias
 */
function hookGetValue(parameter, alias) {
    var name = parameter.name;
    var getValue = parameter.getValue.bind(parameter);
    
    parameter.getValue = function(req) {
        var value = getValue(req);
        if (value.value) {
            debug('value found on official name [%s]', name);
            return value;
        }
        
        parameter.name = alias;
        value = getValue(req);
        parameter.name = name;

        debug('value of parameter [%s] was tried and %sfound under alias [%s]', name, value.value ? "" : "NOT ", alias, value.value);
        
        return value
    };
}