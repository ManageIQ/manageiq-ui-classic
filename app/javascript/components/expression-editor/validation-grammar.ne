Main -> E
E -> _ disjunction _  {% (d) => (d[1]) %}


disjunction -> disjunction _ "OR" _ conjunction  {% (d) => ({left: d[0], right: d[4], operator: 'OR'}) %}
    | conjunction {% (d) => (d[0]) %}
conjunction -> conjunction _ "AND" _ simple_expression {% (d) => ({left: d[0], right: d[4], operator: 'AND'}) %}
    | simple_expression {% (d) => (d[0]) %}
	
simple_expression -> field_expression  {% (d) => (d[0]) %}
   | tag_expression   {% (d) => (d[0]) %}
   | count_expression  {% (d) => (d[0]) %}
   | find_expression   {% (d) => (d[0]) %}
   |  "(" disjunction ")" {% (d) => (d[1]) %} 
   
field_expression
    -> entity "." field operator value {% (d) => ({value:[d[0], d[2], d[3], d[4]].flat().map(e => ({type: e.type, value: e.value})),  type: "field" }) %}
    | FIELD entity "." field operator value {% (d) => ({value:[d[1], d[3], d[4], d[5]].flat().map(e =>     ({type: e.type, value: e.value})), type: "field" }) %}

tag_expression -> TAG entity "." category tag_operator value {% (d) => ({results:[d[1], d[3], d[4], d[5]].flat().map(e => ({type: e.type, value: e.value})), type: "tag" }) %}


count_expression -> COUNT_OF entity operator value {% (d) => ({results: [d[1], d[2], d[3]].flat().map(e => ({type: e.type, value: e.value})), type: "count of" }) %}
find_expression ->  FIND entity "." field operator value check {% (d) => ({type:'expression', results:[d[1], d[3], d[4], d[5], d[6].results].flat().map(e => ({type: e.type, value: e.value})), type: "find", next: d[6].next }) %}

entity -> literals {% (d) => ({type:'entity', value:d[0] }) %}
         | entity "." literals {% (d) => ( [d[0]].flat().concat([{type: "entity", value: d[2] }])) %}
         | text_value {% (d) => ({type:'field', value:d[0] }) %}
         | entity "." text_value {% (d) => ( [d[0]].flat().concat([{type: "entity", value: d[2] }])) %}

field  -> literals {% (d) => ({type:'field', value:d[0] }) %}
        | text_value {% (d) => ({type:'field', value:d[0] }) %}


operator -> _ "=" {% (d) => ({type:'operator', value:d[1] }) %}
          | _ "CONTAINS" {% (d) => ({type:'operator', value:d[1] }) %}
		  | _ "<" {% (d) => ({type:'operator', value:d[1] }) %}
		  | _ ">" {% (d) => ({type:'operator', value:d[1] }) %}
		  | _ ">=" {% (d) => ({type:'operator', value:d[1] }) %}
		  | _ "<=" {% (d) => ({type:'operator', value:d[1] }) %}
		  | _ "INCLUDES" {% (d) => ({type:'operator', value:d[1] }) %}
		  | _ "IS NOT EMPTY" {% (d) => ({type:'operator', value:d[1] }) %}
		  | _ "IS" {% (d) => ({type:'operator', value:d[1] }) %}
		  | _ "STARTS WITH" {% (d) => ({type:'operator', value:d[1] }) %}
		  | _ "REGULAR EXPRESSION MATCHES" {% (d) => ({type:'operator', value:d[1] }) %}

value -> _ literals {% (d) => ({type:'value', value:d[1] }) %}
       | _ text_value {% (d) => ({type:'value', value:d[1] }) %}
	   
category  -> _ literals {% (d) => ({type:'category', value:d[1] }) %}
           | _ text_value {% (d) => ({type:'category', value:d[1] }) %}

tag_operator -> _ "=" {% (d) => ({type:'operator', value:d[1] }) %}
              | _ "CONTAINS" {% (d) => ({type:'operator', value:d[1] }) %}
              | _ ":" {% (d) => ({type:'operator', value:d[1] }) %}

check -> CHECK_ALL field operator value {% (d) => ({results: [d[1], d[2], d[3]], type: "find" }) %}
       | CHECK_ANY field operator value {% (d) => ({results: [d[1], d[2], d[3]], type: "find" }) %}
       | CHECK_COUNT operator value {% (d) => ({results: [d[1], d[2]], type: "find" }) %}
      
text_value -> [\"] not_quote [\"] {% (d) => ( d[1] ) %}
            | [\"] not_quote {% (d) => ( d[1] ) %}
			| [\"] [\"]  {% (d) => ( "" ) %}
			| [\"]  {% (d) => ( "" ) %}

literals ->  [a-zA-Z0-9] {% (d) => ( d[0]) %}
          | literals [a-zA-Z0-9] {% (d) => ( d[0]+d[1]) %}


not_quote ->  [^"] {% (d) => ( d[0]) %}
          | not_quote [^"] {% (d) => ( d[0]+d[1]) %}


FIELD       -> _ ("FIELD" | "Field") _ ":" _ {% (d) => ( null ) %}
TAG        -> _ ("TAG" | "Tag") _ ":" _ {% (d) => ( null ) %}
COUNT_OF    -> _ ("COUNT OF" | "Count of") _ ":" _ {% (d) => ( null ) %}
FIND        -> _ ("FIND" | "Find") _ ":" _ {% (d) => ( null ) %}
REGKEY      -> _ ("REGKEY" | "Regkey") _ ":" _ {% (d) => ( null ) %}
CHECK_ALL   -> _ ("CHECK ALL" | "Check all") _ ":" _ {% (d) => ( null ) %}
CHECK_ANY   -> _ ("CHECK ANY" | "Check any") _ ":" _ {% (d) => ( null ) %}
CHECK_COUNT -> _ ("CHECK COUNT"| "Check count") _ ":" _ {% (d) => ( null ) %}

_           -> [\s]:*     {% (d) => ( null ) %}
__          -> [\s]:+     {% (d) => ( null ) %}
any         -> .:*