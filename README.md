# swagger-params-alias

A reusable pipe to be used with `swagger-node-runner` projects that allow specs
to give aliases to parameters.

# How does it work?

The project elevates few known points about `swagger-node-runner`:
 - it uses `bagpipes` to manage the internal flow of each request
 - it uses `config` to read all the pipes
 - it uses `sway` to read the openapi-spec document into a `sway.SwaggerApi`
   model.
   
Basically, `swagger-node-runner` uses a single instance of `sway.SwaggerApi` to
handle all the requests. Once it obtained this `sway.SwaggerApi` instance, 
it creates all the fittings that are listed in `config.bagpipes`.

This pipe uses it's creation hook on server load time to go over all parameters
of all operations found on the `sway.SwaggerApi` model, and whenever a parameter 
defines an alias - it wraps it's `sway.Parameter#getValue(req)` method with a 
fallback to the provided alias in case no value is found on the official name.

As a result, flow of parameters that do not define an alias is not changed, where
parameters that define an alias will try the alias in case the parameter of the 
official name has no value.

#How to install it?

`npm install swagger-params-alias --save`

# How to use it?

All you need to do is add the following section in your `swagger.bagpipes` config:

```
    openapi-params-alias:
      name:                   swagger-params-alias
      aliasAttribute:         x-alias
```

You can use the `aliasAttribute` to customize the attribute name that defines 
the alias if you don't like the default. 
If it's missing, the default value is `x-alias`.

Once added to your `swagger.bagpipes`, you can now name an alias for parameters
with the attribute that is named in `aliasAttribute`:

```
        - name:         name
          x-alias:      n
          in:           query
          description:  The name of the person to whom to say hello
          required:     true
          type:         string
```
In this example, this `name` parameter has now an alias called `n`.
Whenever a value is not found on `name` - it is tried at `n`.
This also means that if a request provides both `name` and `n` only the value
in the official name is used.

# To Do
 - allow define a fallback channel, e.g. - not found name on query? search in formData.
   e.g:
   
```
        - name:         name
          in:           query
          x-alias:      
            name:       n
            in:         formData
```

# Lisence: 
MIT, and that's it :)

