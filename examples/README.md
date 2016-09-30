# The HScheme Programming Language

HScheme is a simplified Scheme. There are some differences between them.

===========================

### HScheme has

* Primitive type: Int, Double, Bool, Char, List

* BuiltIn Operators (they are not functions, so can't be passed and returned):
    * arith: +, -, *, /, %,
    * compare: =, !=, >, <, >=, <=
    * logic: ||, &&, !
    * list: <-, ->, :, ><  (They are 'car', 'cdr', 'cons', 'null?')

* Some BuiltIn Function:
    * map, filter, foldr, foldl, etc.

* If Expression, Cond Expression and Let Expression

* Lambda Expression

* Closure

* First-Class Function

* Everything is immutable
