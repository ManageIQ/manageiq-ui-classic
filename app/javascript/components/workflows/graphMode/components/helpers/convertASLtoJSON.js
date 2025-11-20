

import { canvasController } from "../App";
import {schema} from "./schemaBase"
import { v4 as uuidv4 } from 'uuid';
import { getImagePath } from "./imageMapping";
import { aslToElyraCanvas } from "./aslToElyraCanvas";

export let primary_pipeline_id ="";
 export let ASLFile = "";
export const getConvertedJson=(aslFile)=>{
   // console.log(schema);
   ASLFile = aslFile
    console.log(aslFile);
   // const graph = buildStateGraph(aslFile);
   
    const comment = aslFile.Comment;
    setIDs(schema);
     var primary_pipeline = schema.primary_pipeline;
    // let pipelines = schema.pipelines;
  
    primary_pipeline_id = schema.primary_pipeline;
    //let mainIndx = getMainPipleline(primary_pipeline, pipelines);
    //setComment(schema.pipelines[0], comment);
    let firstNodeLabel = aslFile.StartAt;

   // const nodes = getConvertedNodes(aslFile);
    const pipelineData = aslToElyraCanvas(aslFile, primary_pipeline_id);
    //const canvasData = JSON.stringify(pipelineData, null, 2);
    console.log(pipelineData);
    schema.pipelines= pipelineData.pipelines;
    
    console.log(schema);
    return schema;
};

function aslToElyraCanvas2(stateMachine, pipeline_id) {
  const states = stateMachine.States;
  const firstNode = stateMachine.StartAt;
  const pipelines = [];
  const nodes = [];
  const links = [];
  const idMap = {}; // maps stateName to unique id

  let idCounter = 1;

  // Step 1: Build nodes
  for (const [stateName, state] of Object.entries(states)) {
    const nodeId = uuidv4();
    let image  = getImagePath(state.Type);
    let operation =  state.Type.toLowerCase();
    idMap[stateName] = nodeId;
    var nodeObj = {
      id: nodeId,
     // op : operation,
      type: state.Type,
      inputs: [ {
                        "id": "inPort",
                        "app_data": {
                            "ui_data": {
                                "cardinality": {
                                    "min": 1,
                                    "max": 1
                                },
                                "label": "Input Port"
                            }
                        }
                    }],
      outputs: [{
                        "id": "outPort",
                        "app_data": {
                            "ui_data": {
                                "cardinality": {
                                    "min": 1,
                                    "max": 1
                                },
                                "label": "Output Port"
                            }
                        }
                    }],
      app_data:{"ui_data": {"label":stateName , "image":image, "x_pos": 100,"y_pos": (idCounter++) * 120 }}
    };
    
    if(stateName!==firstNode){
    nodeObj.inputs = [{links:[]}];
    }

     if (state.Type === "Map" && state.ItemProcessor) {
      const subPipelineId = uuidv4();

      nodeObj.subflow_ref = {
            pipeline_id_ref:subPipelineId
          };
      nodeObj.type = "super_node";
      nodeObj.op = "map";
      nodeObj.app_data.node_asl_data = {type: "Map"};
      // Recursively process subflow into new pipeline
      const subflowCanvas = aslToElyraCanvas({
        States: state.ItemProcessor.States,
        StartAt: state.ItemProcessor.StartAt
      }, subPipelineId);

      pipelines.push(...subflowCanvas.pipelines);
    }
    else if (state.Type === "Parallel") {
      const parallelIdMap ={};
      // Add Parallel inside a supernode which itself has binding inside
      // const supernodeId = uuidv4();
      // const supernodeLabel = "WrapperSupernode";
      const wrapperPipelineId= uuidv4();
      // const superNode = {
      //   id: supernodeId,
      //   type: "super_node",
      //   op: "ParallelWrapper",
      //   label: supernodeLabel,
      //   subflow_ref: {pipeline_id_ref:""},
      //   x_pos: 300,
      //   y_pos: idCounter++ * 50
      // };
    
    

      // const wrapperPipelineId = uuidv4();
      const wrapperNodes = [];
      // const wrapperLinks = [];

      const inBindingId = uuidv4();
      const parallelNodeId = uuidv4();
      const outBindingId = uuidv4();
      const imageforParallel =  getImagePath("Parallel");
      const parallelLabel = "Parallel";
      parallelIdMap[parallelLabel]=parallelNodeId;

      wrapperNodes.push(
        {
          id: inBindingId,
          type: "binding",
          //op: "Binding",
          app_data: {
            "ui_data": {
              "label": "Binding",
              "x_pos": 100,
              "y_pos": (idCounter++) * 120,
              "description": "Supernode binding node"
            }},
            outputs : [{"ui_data": {
                  "cardinality": {
                    "min": 1,
                    "max": 1
                  },
                label : "Binding port for supernode"}}]
         
        },
        {
          id: parallelNodeId,
          type: "Parallel",
         // op: "parallel",
          app_data: {
            "ui_data": {
              "label": "Parallel",
              "x_pos": 300,
              "y_pos": (idCounter++) * 50,
              "description": "Parallel node",
              "image":imageforParallel
            }},
          inputs :[{links :[
          { 
          "id": `link-${inBindingId}-${parallelNodeId}`,
          "node_id_ref": inBindingId
        }]
      }],
        },
        {
          id: outBindingId,
          type: "binding",
         // op: "Binding",
           inputs :[{links :[
          { 
          "id": `link-${parallelNodeId}-${outBindingId}`,
          "node_id_ref": parallelNodeId
        }]
      }],
          app_data: {
            "ui_data": {
              "label": "Binding",
              "x_pos": 500,
              "y_pos": (idCounter++) * 50,
              "description": "Supernode binding node"
            }},
        }
      );
    nodeObj.subflow_ref = {
            pipeline_id_ref:wrapperPipelineId
      };
    nodeObj.type = "super_node";
    nodeObj.op = "parallelWrapper";
    nodeObj.app_data.ui_data.label =  "super_"+stateName;
    // nodeObj.app_data.ui_data.y_pos = 314;
    // nodeObj.app_data.ui_data.x_pos = 214
     nodeObj.app_data.ui_data["is_expanded"]=true;
     nodeObj.inputs[0]["subflow_node_ref"]= inBindingId;
     nodeObj.inputs[0]["app_data"] = {
                "ui_data": {
                  "cardinality": {
                    "min": 1,
                    "max": 1
                  }}}
     nodeObj.outputs[0]["subflow_node_ref"] = outBindingId;
     nodeObj.app_data.ui_data.image = "useDefaultIcon"
    
     // console.log(nodeObj);
     

      
    
    state.Branches.forEach((branch, index) => {
        console.log(branch);
       // let sourceId =parallelNodeId;
        const startAt = branch.StartAt;
       // console.log(startAt);
       // const branchPipelineId = uuidv4();
        // const branchNodes = [];
        // const branchLinks = [];

        for (const [bStateName, bState] of Object.entries(branch.States)) {
         // console.log( branch.States);
          
          const branchNodeId = uuidv4();
          parallelIdMap[bStateName]= branchNodeId
           
         //idMap[bStateName]= branchNodeId;
          wrapperNodes.push({
            id: branchNodeId,
            type: bState.Type,
            //op: bState.Type,
            app_data: {
              ui_data: {
                label: bStateName,
                image : getImagePath(bState.Type),
                x_pos: 500,
                y_pos: (idCounter++) * 50,    
              }},
          inputs :[{
            links :[]
          // { 
          // "id": `link-${parallelNodeId}-${branchNodeId}`,
          // "node_id_ref": parallelNodeId
          // }
        }]  
          });

          // if (bState.End === true) {
          //   wrapperNodes.find(n => n.id === branchNodeId).app_data.is_final_node = true;
          // }
        }
        for (const [stateName, state] of Object.entries(branch.States)) {
        const sourceId = parallelIdMap[stateName];
      const addLink = (targetName) => {
      const targetId = parallelIdMap[targetName];
      var obj={};
      if (targetId) {
        obj = {
          "id": `link-${sourceId}-${targetId}`,
          // "srcNodeId": sourceId,
          // "trgNodeId": targetId,
          "node_id_ref": sourceId
        };
      }
      //console.log(nodes, obj)
      wrapperNodes.forEach((node)=>{
        if(node.id===targetId){  
          node.inputs[0].links.push(obj);
        }
      });
      
    };
     state.Branches?.forEach(branch => addLink(branch.StartAt));
     
       if (state.Next) addLink(state.Next);

     
      
}
   wrapperNodes.forEach((node)=>{
          const trgId = parallelIdMap[startAt];
        if(node.id===trgId){  
          node.inputs[0].links.push( {
          "id": `link-${parallelNodeId}-${trgId}`,
          // "srcNodeId": sourceId,
          // "trgNodeId": targetId,
          "node_id_ref": parallelNodeId
        });
        }
      });
      
    
        // pipelines.push({
        //   id: branchPipelineId,
        //   nodes: branchNodes,
        //   links: branchLinks,
        //   comments: []
        // });

        //wrapperNodes[1].subflow_ref.push(branchPipelineId);
      });
      pipelines.push({
        id: wrapperPipelineId,
        nodes: wrapperNodes,
        //links: wrapperLinks,
      });

      //superNode.subflow_ref.pipeline_id_ref = wrapperPipelineId;
     

    } 
    // if(state.Type === "Parallel"  && state.Branches) {
    //   const startBindingId = uuidv4();
    //   const endBindingId = uuidv4();
    //   const superNodeId = uuidv4();
    //   const subPipelineId = uuidv4();

    //    const startBindingNode = {
    //     id: startBindingId,
    //     type: "binding",
    //     op: "Binding",
    //     label: "StartBinding",
    //     x_pos: 100,
    //     y_pos: 100
    //   };

    //    const superNode = {
    //     id: superNodeId ,
    //     type: "super_node",
    //     op: "Parallel",
    //     label: "Parallel_NODE",
    //     subflow_ref: 
    //      {
    //         pipeline_id_ref: subPipelineId
    //       },
        
    //     x_pos: 300,
    //     y_pos: 100
    //   };

    //   const endBindingNode = {
    //     id: endBindingId,
    //     type: "binding",
    //     op: "Binding",
    //     label:"EndBinding",
    //     x_pos: 500,
    //     y_pos: 100
    //   };
    //    nodes.push(startBindingNode, superNode, endBindingNode);

    //   links.push(
    //     { id: `link-${startBindingId}-${nodeId}`, srcNodeId: startBindingId, trgNodeId: nodeId, type: "nodeLink" },
    //     { id: `link-${nodeId}-${endBindingId}`, srcNodeId: nodeId, trgNodeId: endBindingId, type: "nodeLink" }
    //   );

    //   state.Branches.forEach((branch, index) => {
    //     const subCanvas = aslToElyraCanvas(branch, subPipelineId);
    //     pipelines.push(...subCanvas.pipelines);
    //   });
    //   //const node = createSuperNode();
    //   //console.log(node);
    // }

  nodes.push(nodeObj);
  }

  

  // Step 2: Build links
  for (const [stateName, state] of Object.entries(states)) {
    const sourceId = idMap[stateName];
    const addLink = (targetName) => {
      const targetId = idMap[targetName];
      var obj={};
      if (targetId) {
        obj = {
          "id": `link-${sourceId}-${targetId}`,
          // "srcNodeId": sourceId,
          // "trgNodeId": targetId,
          "node_id_ref": sourceId
        };
      }
      console.log(nodes, obj)
      nodes.forEach((node)=>{
        if(node.id===targetId){  
          node.inputs[0].links.push(obj);
        }
      });
      
    };

    switch (state.Type) {
      case "Choice":
        state.Choices?.forEach(choice => addLink(choice.Next));
        if (state.Default) addLink(state.Default);
        break;

      case "Parallel":
        //state.Branches?.forEach(branch => addLink(branch.StartAt));
        if (state.Next) addLink(state.Next);
        break;

      case "Map":
        if (state.Next) addLink(state.Next);
        break;

      case "Succeed":
      case "Fail":
      case "Pass":
      case "Task":
      case "Wait":
        if (state.Next) addLink(state.Next);
        break;
    }
  }
  console.log(pipelines);
   pipelines.push({
      
        id: pipeline_id,
        nodes,
        app_data : {ui_data : {comments:[]}}
      
    });
  return {pipelines};
}

// function buildStateGraph(stateMachine) {
//   const graph = {};
//   const states = stateMachine.States;

//   for (const [stateName, state] of Object.entries(states)) {
//     graph[stateName] = [];

//     switch (state.Type) {
//       case 'Choice':
//         state.Choices?.forEach(choice => {
//           if (choice.Next) graph[stateName].push(choice.Next);
//         });
//         if (state.Default) graph[stateName].push(state.Default);
//         break;

//       case 'Parallel':
//         state.Branches?.forEach(branch => {
//           graph[stateName].push(branch.StartAt);
//         });
//         if (state.Next) graph[stateName].push(state.Next);
//         break;

//       case 'Map':
//         if (state.Iterator) {
//           graph[stateName].push(state.Iterator.StartAt);
//         }
//         if (state.Next) graph[stateName].push(state.Next);
//         break;

//       default:
//         if (state.Next) {
//           graph[stateName].push(state.Next);
//         }
//     }
//   }

//   return graph;
// }
// function getDepth(stateName, states) {
//   let depth = 0;
//   let current = stateName;
//   while (states[current]?.Next) {
//     current = states[current].Next;
//     depth++;
//   }
//   return depth;
// }

function setComment(code , comment){
    code.comment = comment;

}

function setIDs(json){
    json.id = uuidv4();
   // json.primary_pipeline = uuidv4();
   // json.pipelines[0].id = json.primary_pipeline;
}

// function traverseStateMachine(stateMachine) {
//   const states = stateMachine.States;
  
// }

function getConvertedNodes(stateMachine){
    const states = stateMachine.States;
    var nodesArr = [];
    let currentStateName = stateMachine.StartAt;
    let firstNode = stateMachine.StartAt;
    let prevNode ="";
    let x=100,y=100;
    while (currentStateName) {
    const currentState = states[currentStateName];
    //console.log(`Visiting: ${currentStateName}, Type: ${currentState.Type}`);  
        let srcNodeId = uuidv4();
        let image  = getImagePath(currentState.Type);
       var obj = createNodeObj(srcNodeId ,currentStateName, currentState.Type , image , x, y);
       if(currentStateName!==firstNode){
            setLinks(obj, prevNode);
        }
      
        nodesArr.push(obj);
    

    if (currentState.Type === 'Succeed' || currentState.Type === 'Fail') {
      break;
    }
    prevNode = srcNodeId;
    currentStateName = currentState.Next;
    y+=100;

  }
       return nodesArr;
   // console.log(nodesArr);
}

 const createNodeObj=(srcNodeId,currentStateName, Type , image , x, y)=>{
     var obj = {
        "id" : srcNodeId,
        "type": Type,
        "inputs" : [ {
              "id": "inPort",
              "app_data": {
                "ui_data": {
                  "cardinality": {
                    "min": 1,
                    "max": 1
                  },
                  "label": "Input Port"
                }
              }
            }],
        "outputs" : [{
              "id": "outPort",
              "app_data": {
                "ui_data": {
                  "cardinality": {
                    "min": 1,
                    "max": 100
                  },
                  "label": "Output Port"
                }
              }
            }],
        "app_data":{"ui_data": {"label":currentStateName , "image":image, "x_pos": x,"y_pos": y }}
        }

        return obj;
}

const setLinks=(obj, prevNode)=>{
           const linkId =uuidv4();
            obj.inputs[0].links=[
                {
                  "id": linkId,
                  "node_id_ref": prevNode,
                  "port_id_ref": "outPort",
                  "app_data": {
                    "ui_data": {
                      "decorations": [
                        // {
                        //   "id": "234",
                        //   //"label":"",
                        //   //"label_editable": true
                        // }
                      ]
                    }
                  }
                }
            ];
            //canvasController.setNodeDataLinkSrcInfo(linkId, srcNodeId, "outputPortRef", pipelineId)
        
}
export const getMainPipleline=(id, pipelines)=>{

for(let i=0 ; i< pipelines.length ; i++){
        if(pipelines[i].id===id)
            return i;
        
    }
}