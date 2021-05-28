const grammar = `/* description: Parses and executes mathematical expressions. */

/* lexical grammar */
%lex
%%

\\s+                   /* NO return 'SPACE' */
":"                   return ':'
"."                   return '.'
"("                   return '('
")"                   return ')'
["'].*?["']               return 'TEXT_VALUE'
'"'                   return '"'
"="                   return '='
">"                   return '>'
"<"                   return '<'
"AND"                return 'AND'
"OR"                 return 'OR'
"NOT"                return 'NOT'
"FIELD"               return 'FIELD'
"FIND"                return 'FIND'
"TAGS"                 return 'TAG'
"COUNT OF"            return 'COUNTOF'
"REGISTRY"            return 'REGKEY'
"CONTAINS"            return 'CONTAINS'
"IS"                  return 'IS'
"STARTS WITH"         return 'STARTS_WITH'
"EMPTY"               return 'EMPTY'
"INCLUDES"            return 'INCLUDES'
"FROM"                return 'FROM'
"THROUGH"             return 'THROUGH'
"REGULAR EXPRESSION MATCHES" return 'REGEXP_MATCH'
"CHECK ALL"            return 'CHECKALL'
"CHECK ANY"            return 'CHECKANY'
"CHECK COUNT"            return 'CHECKCOUNT'
[a-zA-Z_0-9]+            return 'LITERAL'
<<EOF>>               return 'EOF'

/lex


%start expression
 %left 'OR'
 %left 'AND'
 %left 'NOT'
%% /* language grammar */

expression
  : e EOF
      { typeof console !== 'undefined' ? console.log($1) : print($1);
        return $1; }
  ;

e
  : field_expression
  | tag_expression
  | count_expression
  | find_expression
  | e OR e
    {{$$={type: 'expressionOperator', value: $2, left: $1, right: $3 };}}
  | e AND e
    {{$$={type: 'expressionOperator', value: $2, left: $1, right: $3 };}}
  | NOT e
    {{$$={type: 'expressionOperator', value: "NOT", next: $2 };}}
  | '(' e ')'
    {{$$={type: 'parentheses', value: $2, left: $1, right: $3 };}}
  ;

field_expression
  : FIELD ':' entity '.' field operator_and_value
    {{$$={type: $1, entity: $3, field: $5, operator: $6, value: $6.value};}}
  | entity '.' field operator_and_value
    {{$$={type: 'field', entity: $1, field: $3, operator: $4, value: $4.value};}}
  ;

/*
  tags: VM.category value
  tags: VM.category: value
  tags: VM.category = value
*/
tag_expression
  : TAG ':' entity '.' category tag_operator value
    {{$$={type: $1, entity: $3, category: $5, value: $7};}}
  ;

tag_operator
  : | ':' | CONTAINS | '='
  ;

count_expression
  : COUNTOF ':' entity operator_and_value
    {{$$={type: $1, entity: $3, operator: $4, value: $4.value};}}
  ;

find_expression
  : FIND ':' entity '.' field operator_and_value check
    {{$$={type: $1, entity: $3, field: $5, operator: $6, value: $6.value, check: $7 };}}
  ;

reg_expression
  : REGKEY ':' key ':' reg_value ':' operator
     {{$$={type: $1, entity: $3, field: $5, operator: $7 };}}
  ;

type
  : LITERAL
    {{$$={type: 'expType', value: $1.trim()};}}
  ;

entity
  : LITERAL
    {{$$={type: 'entity', value: $1.trim()};}}
  | TEXT_VALUE
    {{$$={type: 'entity', value: $1.slice(1,$1.length-1)};}}
  | entity '.' LITERAL
    {{$$={type: 'relation', next: $1, value: $3.trim()};}}
  | entity '.' TEXT_VALUE
    {{$$={type: 'relation', next: $1, value: $3.slice(1,$3.length-1)};}}
  ;

field
  : LITERAL
    {{$$={type: 'field', value: $1.trim()};}}
  | TEXT_VALUE
    {{$$={type: 'field', value: $1.slice(1,$1.length-1)};}}
  ;

category
  : LITERAL
    {{$$={type: 'category', value: $1.trim()};}}
  | TEXT_VALUE
    {{$$={type: 'category', value: $1.slice(1,$1.length-1)};}}
  ;

operator_and_value
  : CONTAINS value
    {{$$={type: 'operator', operator: $1.trim(), value: $2};}}
  | '=' value
    {{$$={type: 'operator', operator: $1.trim(), value: $2};}}
  | '>' '=' value
    {{$$={type: 'operator', operator: '>=', value: $3};}}
  | '<' '=' value
    {{$$={type: 'operator', operator: '<=', value: $3};}}
  | INCLUDES value
    {{$$={type: 'operator', operator: $1.trim(), value: $2};}}
  | 'IS' 'NOT' 'EMPTY'
    {{$$={type: 'operator', operator: 'IS_NOT_EMPTY'};}}
  | 'IS' value
    {{$$={type: 'operator', operator: 'IS', value: $2};}}
  | 'STARTS_WITH' value
    {{$$={type: 'operator', operator: $1.trim(), value: $2};}}
  | 'FROM' value 'THROUGH' value
    {{$$={type: 'operator', operator: $1.trim(), value: [$2, $4]};}}
  | 'REGEXP_MATCH' value
    {{$$={type: 'operator', operator: $1, value: $2};}}
  ;

value
  : LITERAL
    {{$$={type: 'value', value: $1.trim()};}}
  | TEXT_VALUE
    {{$$={type: 'value', value: $1.slice(1,$1.length-1)};}}
  ;

check
  : CHECKALL ':' field operator_and_value
    {{$$={type: 'check_all', field: $3, operator: $4, check_value: $4.value};}}
  | CHECKANY ':' field operator_and_value
    {{$$={type: 'check_any', field: $3, operator: $4, check_value: $4.value};}}
  | CHECKCOUNT ':' operator_and_value
    {{$$={type: 'check_count', operator: $3, check_value: $3.value};}}
;
`;

export default grammar;
