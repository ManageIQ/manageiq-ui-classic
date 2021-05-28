
Main -> E
E -> field_expression  {% (d) => (d[0]) %}
   | tag_expression   {% (d) => (d[0]) %}
   | count_expression  {% (d) => (d[0]) %}
   | find_expression   {% (d) => (d[0]) %}
   | _ "(" _ E {% (d) => (d[3]) %}
   | E _ ")" {% (d) => (d[0]) %}
   | _ "(" _ E _ ")" {% (d) => (d[3]) %}
   | E "OR" E {% (d) => (d[3]) %}


field_expression -> _ cursor {% (d) => ({results: [], next: ["entity", "exp_type"] }) %}
  | entity cursor {% (d) => ({results: [d[0]].flat().map(e => ({type: e.type, value: e.value})), next: d[0].next || ["entity", "field"], type: "field" }) %}
  | entity "." _ cursor {% (d) => ({ results:[d[0], {value: ""}].flat().map(e => ({type: e.type, value: e.value})), next: ["entity", "field"], type: "field" }) %}
  | entity "." field __ cursor {% (d) => ({results:[d[0], d[2], , {value: ""}].flat().map(e => ({type: e.type, value: e.value})), next: ["operator"], type: "field" }) %}
  | entity "." field __ literals cursor {% (d) => ({results:[d[0], d[2],  {type: "operator", value: d[4]}].flat().map(e => ({type: e.type, value: e.value})), next: ["operator"], type: "field" }) %}
  | entity "." field operator _ cursor {% (d) => ({results:[d[0], d[2], d[3], {value: ""}].flat().map(e => ({type: e.type, value: e.value})),  next: ["value"], type: "field" }) %}
  | entity "." field operator value cursor {% (d) => ({results:[d[0], d[2], d[3], d[4]].flat().map(e => ({type: e.type, value: e.value})), next: ["value"], type: "field" }) %}
  | entity "." field operator value __ cursor {% (d) => ({results:[d[0], d[2], d[3], d[4], {value: ""}].flat().map(e => ({type: e.type, value: e.value})), next: ["expression_operator"], type: "field" }) %}
  | entity "." field operator value __ literals cursor {% (d) => ({results:[d[0], d[2], d[3], d[4], {value: d[6]}].flat().map(e => ({type: e.type, value: e.value})), next: ["expression_operator"], type: "field" }) %}
  | FIELD _ cursor {% (d) => ({results: [], next: ["entity"], type: "field" }) %}
  | FIELD entity cursor {% (d) => ({results: [d[1]].flat().map(e => ({type: e.type, value: e.value})), next: ["entity", "field"], type: "field" }) %}
  | FIELD entity "." _ cursor {% (d) => ({ results:[d[1], {value: ""}].flat().map(e => ({type: e.type, value: e.value})), next: ["entity", "field"], type: "field" }) %}
  | FIELD entity "." field __ cursor {% (d) => ({results:[d[1], d[3], {value: ""}].flat().map(e => ({type: e.type, value: e.value})), next: ["operator"], type: "field" }) %}
  | FIELD entity "." field __ literals cursor {% (d) => ({results:[d[1], d[3],  {type: "operator", value: d[5]}].flat().map(e => ({type: e.type, value: e.value})), next: ["operator"], type: "field" }) %}

  | FIELD entity "." field operator _ cursor {% (d) => ({results:[d[1], d[3], d[4], {value: ""}].flat().map(e => ({type: e.type, value: e.value})),  next: ["value"], type: "field" }) %}
  | FIELD entity "." field operator value cursor {% (d) => ({results:[d[1], d[3], d[4], d[5]].flat().map(e => ({type: e.type, value: e.value})), next: ["value"], type: "field" }) %}
  | FIELD entity "." field operator value __ cursor {% (d) => ({results:[d[1], d[3], d[4], d[5], {value: ""}].flat().map(e => ({type: e.type, value: e.value})), next: ["expression_operator"], type: "field" }) %}
  | FIELD entity "." field operator value __ literals cursor {% (d) => ({results:[d[1], d[3], d[4], d[5], {value: d[7]}].flat().map(e => ({type: e.type, value: e.value})), next: ["expression_operator"], type: "field" }) %}

tag_expression -> TAG _ cursor {% (d) => ({results: [], next: ["entity"], type: "tag" }) %}
  | TAG entity cursor {% (d) => ({results: [d[1]].flat().map(e => ({type: e.type, value: e.value})), next: ["entity", "category"], type: "tag" }) %}
  | TAG entity "." _ cursor {% (d) => ({results: [d[1], {value: ""}].flat().map(e => ({type: e.type, value: e.value})), next: ["entity", "category"], type: "tag" }) %}
  | TAG entity "." category __ cursor {% (d) => ({results:[d[1], d[3], {value: ""}].flat().map(e => ({type: e.type, value: e.value})), next: ["tag_operator"], type: "tag" }) %}
  | TAG entity "." category tag_operator _ cursor {% (d) => ({results:[d[1], d[3], d[4], {value: ""}].flat().map(e => ({type: e.type, value: e.value})),  next: ["tag_field"], type: "tag" }) %}
  | TAG entity "." category tag_operator value cursor {% (d) => ({results:[d[1], d[3], d[4], d[5]].flat().map(e => ({type: e.type, value: e.value})), next: ["tag_field"], type: "tag" }) %}
  | TAG entity "." category tag_operator value __ cursor {% (d) => ({results:[d[1], d[3], d[4], d[5], {value: ""}].flat().map(e => ({type: e.type, value: e.value})), next: ["expression_operator"], type: "tag" }) %}
    | TAG entity "." category tag_operator value __ literals cursor {% (d) => ({results:[d[1], d[3], d[4], d[5], {value: d[7]}].flat().map(e => ({type: e.type, value: e.value})), next: ["expression_operator"], type: "tag" }) %}


count_expression -> COUNT_OF _ cursor {% (d) => ({results: [], next: ["entity"], type: "count of" }) %}
  | COUNT_OF entity_without_trailing_space cursor {% (d) => ({results: [d[1], {value: ""}].flat().map(e => ({type: e.type, value: e.value})), next: ["entity"], type: "count of" }) %}
  | COUNT_OF entity_without_trailing_space "." _ cursor {% (d) => ({results: [d[1], {value: ""}].flat().map(e => ({type: e.type, value: e.value})), next: ["entity"], type: "count of" }) %}
  | COUNT_OF entity_without_trailing_space __ cursor {% (d) => ({results: [d[1], {value: ""}].flat().map(e => ({type: e.type, value: e.value})), next: ["count_operator"], type: "count of" }) %}
  | COUNT_OF entity_without_trailing_space __ literals cursor {% (d) => ({results: [d[1],  {type: "operator", value: d[3]}].flat().map(e => ({type: e.type, value: e.value})), next: ["count_operator"], type: "count of" }) %}
  | COUNT_OF entity_without_trailing_space count_operator _ cursor {% (d) => ({results: [d[1], d[2], {value: ""}].flat().map(e => ({type: e.type, value: e.value})), next: ["value"], type: "count of" }) %}
  | COUNT_OF entity_without_trailing_space count_operator value cursor {% (d) => ({results: [d[1], d[2], d[3], {value: ""}].flat().map(e => ({type: e.type, value: e.value})), next: ["entity"], type: "count of" }) %}
  | COUNT_OF entity_without_trailing_space count_operator value __ cursor {% (d) => ({results: [d[1], d[2], d[3], {value: ""}].flat().map(e => ({type: e.type, value: e.value})), next: ["expression_operator"], type: "count of" }) %}
  | COUNT_OF entity_without_trailing_space count_operator value __ cursor {% (d) => ({results: [d[1], d[2], d[3], {value: d[5]}].flat().map(e => ({type: e.type, value: e.value})), next: ["expression_operator"], type: "count of" }) %}

find_expression -> FIND _ cursor {% (d) => ({results: [], next: ["entity"], type: "find" }) %}
  | FIND entity cursor {% (d) => ({results: [d[1]].flat().map(e => ({type: e.type, value: e.value})), next: ["entity", "field"], type: "find" }) %}
  | FIND entity "." _ cursor {% (d) => ({ results:[d[1], {value: ""}].flat().map(e => ({type: e.type, value: e.value})), next: ["entity", "field"], type: "find" }) %}
  | FIND entity "." field __ cursor {% (d) => ({results:[d[1], d[3], {value: ""}].flat().map(e => ({type: e.type, value: e.value})), next: ["operator"], type: "find" }) %}
  | FIND entity "." field __ literals cursor {% (d) => ({results:[d[1], d[3],  {type: ["operator"], value: d[5]}].flat().map(e => ({type: e.type, value: e.value})), next: ["operator"], type: "field" }) %}
  | FIND entity "." field operator _ cursor {% (d) => ({results:[d[1], d[3], d[4], {value: ""}].flat().map(e => ({type: e.type, value: e.value})),  next: ["value"], type: "find" }) %}
  | FIND entity "." field operator value cursor {% (d) => ({results:[d[1], d[3], d[4], d[5]].flat().map(e => ({type: e.type, value: e.value})), next: ["value"], type: "find" }) %}
  | FIND entity "." field operator value __ cursor {% (d) => ({results:[d[1], d[3], d[4], d[5], {value: ""}].flat().map(e => ({type: e.type, value: e.value})), next: ["check_operator"], type: "find" }) %}
  | FIND entity "." field operator value check {% (d) => ({type:'expression', results:[d[1], d[3], d[4], d[5], d[6].results].flat().map(e => ({type: e.type, value: e.value})), type: "find", next: d[6].next }) %}


check -> CHECK_ALL _ cursor {% (d) => ({results: [{value: ""}], next: ["field"], type: "find" }) %}
       | CHECK_ALL field cursor {% (d) => ({results: [d[1]], next: ["field"], type: "find" }) %}
       | CHECK_ALL field __ cursor {% (d) => ({results: [d[1], {value: ""}], next: ["operator"], type: "find" }) %}
	   | CHECK_ALL field __ literals cursor {% (d) => ({results: [d[1], {value: d[3]}], next: ["operator"], type: "find" }) %}
       | CHECK_ALL field operator _ cursor {% (d) => ({results: [d[1], d[2], {value: ""}], next: ["value"], type: "find" }) %}
       | CHECK_ALL field operator value cursor {% (d) => ({results: [d[1], d[2], d[3], {value: ""}], next: ["value"], type: "find" }) %}
       | CHECK_ALL field operator value __ cursor {% (d) => ({results: [d[1], d[2], d[3], {value: ""}], next: ["expression_operator"], type: "find" }) %}

       | CHECK_ANY field operator value  {% (d) => ( [d[1], d[2], d[3]].flat().map(e => ({type: e.type, value: e.value})) ) %}
       | CHECK_ANY _ cursor {% (d) => ({results: [{value: ""}], next: ["field"], type: "find" }) %}
       | CHECK_ANY field cursor {% (d) => ({results: [d[1]], next: ["field"], type: "find" }) %}
       | CHECK_ANY field __ cursor {% (d) => ({results: [d[1], {value: ""}], next: ["operator"], type: "find" }) %}
	   | CHECK_ANY field __ literals cursor {% (d) => ({results: [d[1], {value: d[3]}], next: ["operator"], type: "find" }) %}
       | CHECK_ANY field operator _ cursor {% (d) => ({results: [d[1], d[2], {value: ""}], next: ["value"], type: "find" }) %}
       | CHECK_ANY field operator value cursor {% (d) => ({results: [d[1], d[2], d[3], {value: ""}], next: ["value"], type: "find" }) %}
       | CHECK_ANY field operator value __ cursor {% (d) => ({results: [d[1], d[2], d[3], {value: ""}], next: ["expression_operator"], type: "find" }) %}

       | CHECK_COUNT operator value      {% (d) => ( [d[1], d[2]].flat().map(e => ({type: e.type, value: e.value})) ) %}
       | CHECK_COUNT _ cursor {% (d) => ({results: [{value: ""}], next: ["operator"], type: "find" }) %}
	   | CHECK_COUNT field __ literals cursor {% (d) => ({results: [d[1], {value: d[3]}], next: ["operator"], type: "find" }) %}
       | CHECK_COUNT operator _ cursor {% (d) => ({results: [d[1], {value: ""}], next: ["value"], type: "find" }) %}
       | CHECK_COUNT operator value cursor {% (d) => ({results: [d[1], d[2], {value: ""}], next: ["value"], type: "find" }) %}
       | CHECK_COUNT operator value __ cursor {% (d) => ({results: [d[1], d[2], {value: ""}], next: ["expression_operator"], type: "find" }) %}
       | __ literals _ cursor {% (d) => ({results: [{value: d[1]}], next: ["check_operator"], type: "find" }) %}
       | __ literals __ literals cursor {% (d) => ({results: [{value: d[3]}], next: ["check_operator"], type: "find" }) %}




field  -> _ literals {% (d) => ({type:'field', value:d[1] }) %}
        | _ text_value {% (d) => ({type:'field', value:d[1] }) %}

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
		  
count_operator -> _ "=" {% (d) => ({type:'count_operator', value:d[1] }) %}
		  | _ "<" {% (d) => ({type:'count_operator', value:d[1] }) %}
		  | _ ">" {% (d) => ({type:'count_operator', value:d[1] }) %}
		  | _ ">=" {% (d) => ({type:'count_operator', value:d[1] }) %}
		  | _ "<=" {% (d) => ({type:'count_operator', value:d[1] }) %}

category  -> _ literals {% (d) => ({type:'category', value:d[1] }) %}
           | _ text_value {% (d) => ({type:'category', value:d[1] }) %}



 entity -> _ literals _ {% (d) => ({type:'entity', value:d[1], next:["entity", "field", "exp_type"] }) %}
         | entity "." literals {% (d) => ( [d[0]].flat().concat([{type: "entity", value: d[2] }])) %}
         | _ text_value {% (d) => ({type:'field', value:d[1] }) %}
         | entity "." text_value {% (d) => ( [d[0]].flat().concat([{type: "entity", value: d[2] }])) %}

 entity_without_trailing_space -> _ literals {% (d) => ({type:'entity', value:d[1] }) %}
         | entity "." literals {% (d) => ( [d[0]].flat().concat([{type: "entity", value: d[2] }])) %}
         | _ text_value {% (d) => ({type:'field', value:d[1] }) %}
         | entity "." text_value {% (d) => ( [d[0]].flat().concat([{type: "entity", value: d[2] }])) %}


value -> _ literals {% (d) => ({type:'value', value:d[1] }) %}
       | _ text_value {% (d) => ({type:'value', value:d[1] }) %}


text_value -> [\"] not_quote [\"] {% (d) => ( d[1] ) %}
            | [\"] not_quote {% (d) => ( d[1] ) %}
			| [\"] [\"]  {% (d) => ( "" ) %}
			| [\"]  {% (d) => ( "" ) %}

literals ->  [a-zA-Z0-9] {% (d) => ( d[0]) %}
          | literals [a-zA-Z0-9] {% (d) => ( d[0]+d[1]) %}

tag_operator -> _ "=" {% (d) => ({type:'operator', value:d[1] }) %}
              | _ "CONTAINS" {% (d) => ({type:'operator', value:d[1] }) %}
              | _ ":" {% (d) => ({type:'operator', value:d[1] }) %}

cursor -> "<<caret_position>>" any {% (d) => ({type:'cursor', cursor:d[0], rightText: d[1] }) %}

not_quote ->  [^"] {% (d) => ( d[0]) %}
          | not_quote [^"] {% (d) => ( d[0]+d[1]) %}

FIELD       -> _ ("FIELD" | "Field") _ ":" {% (d) => ( null ) %}
TAG        -> _ ("TAG" | "Tag") _ ":" {% (d) => ( null ) %}
COUNT_OF    -> _ ("COUNT OF" | "Count of") _ ":" {% (d) => ( null ) %}
FIND        -> _ ("FIND" | "Find") _ ":" {% (d) => ( null ) %}
REGKEY      -> _ ("REGKEY" | "Regkey") _ ":" {% (d) => ( null ) %}
CHECK_ALL   -> _ ("CHECK ALL" | "Check all") _ ":" {% (d) => ( null ) %}
CHECK_ANY   -> _ ("CHECK ANY" | "Check any") _ ":" {% (d) => ( null ) %}
CHECK_COUNT -> _ ("CHECK COUNT"| "Check count") _ ":" {% (d) => ( null ) %}
_           -> [\s]:*     {% (d) => ( null ) %}
__          -> [\s]:+     {% (d) => ( null ) %}
any         -> .:*