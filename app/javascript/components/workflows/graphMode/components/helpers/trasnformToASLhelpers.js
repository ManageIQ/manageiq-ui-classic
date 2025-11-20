import { canvasController , NodeFlowTypes} from "../App";



// export const transformToASL = (nodesArr , sequence)=>{

//    // console.log("hello", nodesArr , sequence);
//    var ASLObj ={};
//     var States = {};
//     for(var i=0; i< sequence.length ; i++){
//         const nodeId = sequence[i][i];
//        // console.log(nodeId);
//         var newObj ={};
//         for(var j=0; j< nodesArr.length ; j++){
//             var obj = nodesArr[j];
//             if(nodeId===obj.id){
//                 var appData = obj.app_data;
//                 var label = obj.app_data.ui_data.label;
//                 for(var key in appData){
//                     if(key!== "ui_data"){
//                         newObj[label]= appData[key];
//                         newObj[label].Parameters = obj.parameters;
//                         console.log(newObj);
//                         States[label]=newObj[label];
//                     }    
//                 }
//             break;
//             }
//         }
        
//     }
//      const arr=[];
//      for(var key in States){
//         arr.push(key);
//      }
//      var i=0 ;
//      for(i=0; i<arr.length-1; i++){
//         States[arr[i]].Next= arr[i+1];

//      }
//      States[arr[i]].End =true;
//      ASLObj.States=States;
//      return ASLObj;
//}

export const createPipelineflowASL=(pipeline,skeletonCode,  visitedSubflows = new Set())=>{

  const pipelineId = pipeline.id;
  const commentDataArr = pipeline.app_data.ui_data.comments;
  var commentData = "No comments";
  if(commentDataArr.length>0){
    commentData = pipeline.app_data.ui_data.comments[0].content ;
  }
  const comment = commentData;
  //console.log(pipeline);
  const nodesArr = pipeline.nodes;
  
  
  var nextArr =[]; 

  var startId="";
  var startsAt="";
  var idLabelsArray = [];
  for(var i=0; i< nodesArr.length ; i++){
    const nodeJSON = nodesArr[i];
   
    if(nodeJSON.type==='binding'){
      console.log("===",nodeJSON.type);
      continue;
    }
   console.log("////////",nodeJSON);
    var inputs = nodeJSON.inputs[0];
    var nodeData = canvasController.getNode(nodeJSON.id, pipelineId);
    idLabelsArray.push({"id": nodeData.id , "label" : nodeData.label});
   
    if(!inputs.hasOwnProperty("links")){
      startId=nodeJSON.id;
      startsAt = nodeJSON.app_data.ui_data.label;
    }
    else{ 
      var obj = buildNext(nodeJSON, pipelineId); 
        nextArr.push(obj);
    }
  }
  console.log( idLabelsArray );
  console.log(nextArr);
  console.log("---->");

 
  //var arr = structuredClone(nextArr);

  var nodes= canvasController.getNodes();  
 console.log(nodes);
 
 // console.log(skeletonCode);

  for(var i=0 ; i< nodes.length ; i++){
    var node = nodes[i];
    //console.log(node);
    if(node.type==="binding"){
      continue;
    }
   
    var srcId = node.id;
    var srcLabel = node.label;
   
    if(NodeFlowTypes.includes(node.type)){
      console.log("aaa ", node)
      skeletonCode.States[srcLabel]={};
      skeletonCode.States[srcLabel].Type = node.type;
      setNodeParamsAndResource(node , skeletonCode);
      var ind = nextArr.findIndex(srcObj=> srcObj.source === srcId);
    if(ind!=-1){
      var sourceObj = nextArr[ind];
      var targetArr = getSourceObj(nextArr , srcId);
     // console.log("It is a source node " , srcId);
      //buildSkeleton(); 
      console.log("Choice node ", node.type , targetArr)
      getNodeTypes(targetArr, skeletonCode.States[srcLabel], idLabelsArray,node.id,pipelineId);
    }else{
      // mark these nodes as end nddes
      //skeletonCode.States[srcLabel].Type = "Task"
      
      if(node.type === "Fail"){
        skeletonCode.States[srcLabel].Error = "Error occured";
      }
      // }else if(node.type!== "Succeed")
      if(!["Succeed", "Fail"].includes(node.type))
        skeletonCode.States[srcLabel]["End"] = true
      //console.log("It is no target node" , srcId);
    }
    }
    
    // var taskParams = node.parameters;
    // if(node.type==="Task" && taskParams) {
    //   if(taskParams.API_PARAMETERS)
    //     skeletonCode.States[srcLabel].Parameters = taskParams.API_PARAMETERS;
    //   if(taskParams.Resource)
    //     skeletonCode.States[srcLabel].Resource= taskParams.Resource;
    //   else 
    //   skeletonCode.States[srcLabel].Resource = "";
    // }
    ////  ------------- PARALLEL ------------
    if(node.type === "super_node" ){

      const subPipeLineId = node.subflow_ref.pipeline_id_ref;
        // prevent duplicate processing
      if (visitedSubflows.has(subPipeLineId)) continue;
      visitedSubflows.add(subPipeLineId);
      //// Paralle node 
      ////
      /////////
      const dnodes = canvasController.getDownstreamNodes([node.id]);
      const upnodes = canvasController.getUpstreamNodes([node.id]);      
      //console.log(upnodes);
      const mainFlowDownLinks = dnodes.links[pipelineId];
      const mainFlowUpLinks = upnodes.links[pipelineId];
      //console.log(mainFlowUpLinks);
            
      const nextNode = getNextNodeFromLink(mainFlowDownLinks, node.id, pipelineId);
      const prevNode = getPrevNodeFromLink(mainFlowUpLinks, node.id, pipelineId);
      
      const subflowNodes = dnodes.nodes[subPipeLineId];

        if(!node.app_data.node_asl_data){
            
            //console.log(nextNode);
            //console.log(prevNode.label);
            const parallelPipelineId = subPipeLineId;
            

            const parallelNodeId = getParallelNodeId(subflowNodes, parallelPipelineId);
            const parallelNode = canvasController.getNode(parallelNodeId, parallelPipelineId );

            const graph = getParallelNodeGraph(parallelPipelineId);
            const findAllPathsObj = findAllPaths(graph ,parallelNodeId );

            const allPaths = findAllPathsObj.allPaths;
            const leafNodes = findAllPathsObj.leafNodes;
            var srcLabel = parallelNode.label;

            skeletonCode.States[srcLabel] = {};

          //   allPaths.forEach(path => {
          //     console.log(path.join(" → "));
          
          // });   
          skeletonCode.States[srcLabel].Type = "Parallel";

          //skeletonCode.States[srcLabel].Branches = [];
          skeletonCode.States[srcLabel].Branches = buildSkeletonCodeForSubflow(allPaths , parallelNodeId, parallelPipelineId, leafNodes);
          skeletonCode.States[srcLabel].Next = nextNode.label;

          if(!skeletonCode.States[prevNode.label])
             skeletonCode.States[prevNode.label]={};
          skeletonCode.States[prevNode.label].Next = srcLabel ;

          // console.log( parallelPipelineId);
            // const pipelinesArr = pipelineFlow.pipelines;
            // pipelinesArr.forEach( function(item){
            //   if(item.id=== parallelPipelineId){
            //     console.log("---->>>" ,item);
            //   }
            // }); 
       }else if (node.app_data.node_asl_data.type==='Map'){
          const mapPipelineId = subPipeLineId;
       
          //const mapSubFlowNode = canvasController.getNode(parallelNodeId, parallelPipelineId );
          const graph = getParallelNodeGraph(mapPipelineId);
          console.log(graph);
          const startNodeId = findStartNode (graph )[0];
          const startNode = canvasController.getNode(startNodeId, mapPipelineId);
          console.log(startNode);
          const findAllPathsObj = findAllPaths(graph , startNodeId);

          const allPaths = findAllPathsObj.allPaths;
          const leafNodes = findAllPathsObj.leafNodes;

          var srcLabel = node.label;

          skeletonCode.States[srcLabel] = {};
          skeletonCode.States[srcLabel].Type = "Map";
          
          const branches = buildSkeletonCodeForSubflow(allPaths ,startNodeId, mapPipelineId, leafNodes);
          console.log(branches);
          const mode = node.parameters.Mode ? node.parameters.Mode.toUpperCase() : "INLINE";
        
          var States = {}
          States[startNode.label]={"Type": startNode.type , "Next": branches[0].StartAt};
          console.log(States);
          
         const itemProcessorJson = {"ProcessorConfig" : {"Mode" : mode },"States": States , "StartAt": startNode.label};

         if(mode==='DISTRIBUTED'){
               itemProcessorJson.ProcessorConfig["ExecutionType"]= "STANDARD";
               skeletonCode.States[srcLabel]["MaxConcurrency"]= 1000;
          }
          
          Object.assign(itemProcessorJson.States, branches[0].States);
          skeletonCode.States[srcLabel].ItemProcessor = itemProcessorJson ;
          skeletonCode.States[srcLabel].Next = nextNode.label;
          //skeletonCode.States[prevNode.label].Next = srcLabel ;
          //console.log(subflowNodes, " /n next", nextNode.label , "prv -->" , prevNode.label  );

         
       
       }
    } 
    ////////---------MAP --------------- 
     
    
    //buildSkeleton( idLabelsArray);
  }
 
  skeletonCode.Comment = comment;
  skeletonCode.StartAt = startsAt;
  //console.log(skeletonCode);
  //Skeleton code is built .. now we need to map the parameter values etc.
 

  // ASLObj.Comment = comment;
  // ASLObj.StartAt = startsAt;
  
  //console.log(ASLObj);
  // const downloadASLFile = JSON.stringify(skeletonCode, null,2);
  // JavascriptFileDownload(downloadASLFile , "appFile.asl");
}
// asl object ke liye pehle sare nodes ka data dal do  fir source id ka targetobject dal do 
//ho jayega

// get supernode graph traversed 
function getNextNodeFromLink(links, nodeId, pipelineId){
  let nextNode = "";
   links.forEach( function (linkId){
        const link = canvasController.getLink(linkId,  pipelineId);
        if(link.srcNodeId === nodeId){
          const trgNode = canvasController.getNode(link.trgNodeId, pipelineId );
          nextNode = trgNode;
          //console.log(trgNode)
          // if(trgNode.type!=='binding')
          //   endNodes.push(trgNode);
        }
      });
      return nextNode;
}
function getPrevNodeFromLink(links, nodeId, pipelineId){
  let prevNode = "";
   links.forEach( function (linkId){
        const link = canvasController.getLink(linkId,  pipelineId);
        if(link.trgNodeId === nodeId){
          const srcNode = canvasController.getNode(link.srcNodeId, pipelineId );
          prevNode = srcNode;
          console.log(srcNode)
          // if(trgNode.type!=='binding')
          //   endNodes.push(trgNode);
        }
      });
      return prevNode;
}
function getParallelNodeId(nodes, pipelineId){
  let subNodeId="";
  nodes.forEach(id=>{
    const node = canvasController.getNode(id , pipelineId);
    if(node.type==='Parallel'){
      subNodeId = node.id;
    }
  });
  return subNodeId;
}

export const getParallelNodeGraph=(pipelineId )=>{
  var endNodes=[];
  const links = canvasController.getLinks(pipelineId );
  // console.log(nodeId  , " 888888 " , links);
  
  // links.forEach( function (link){
  //   //console.log(canvasController.getNode(link.srcNodeId,  parallelPipelineId));
  //   if(link.srcNodeId === nodeId){
  //     const trgNode = canvasController.getNode(link.trgNodeId, pipelineId );
  //     console.log(trgNode)
  //     if(trgNode.type!=='binding')
  //       endNodes.push(trgNode);
  //   }
  // });
 
  var graph = {};
  links.forEach( function (link){
    var targets =[];

    var srcNode  = canvasController.getNode(link.srcNodeId, pipelineId );
    var trgNode = canvasController.getNode(link.trgNodeId, pipelineId );
    if(srcNode.type!=='binding'  && trgNode.type!=='binding'){
      var key = link.srcNodeId;
      
      if(graph.hasOwnProperty([key])){
        targets = graph[key];
      }
      
      targets.push(link.trgNodeId);
      graph[key] = targets;
      //console.log(link);
  }
  });

  console.log(graph);
  return graph ;
 
  
}
 function findStartNode (graph ){
   const allNodes = new Set(Object.keys(graph));
  const childNodes = new Set();

  Object.values(graph).forEach(neighbors => {
    neighbors.forEach(node => childNodes.add(node));
  });

  // Start nodes are those in graph keys but not in child nodes
  return [...allNodes].filter(node => !childNodes.has(node));
 }
function findAllPaths (graph, start) {
  let allPaths = [];
  const leafNodes =new Set();
  dfs(start, graph, [], allPaths,leafNodes);
  //console.log(leafNodes);
  // allPaths = allPaths.map(p => p.join("->"))
  //                  .filter((p, idx, arr) => arr.indexOf(p) === idx)
  //                  .map(p => p.split("->"));
  return {"allPaths": allPaths , "leafNodes": leafNodes };
}


function dfs(current, graph, path, allPaths, leafNodes) {
  path.push(current);

  const neighbors = graph[current] || [];
  if (neighbors.length === 0) {
    leafNodes.add(current);
    allPaths.push([...path]); // found a complete path
  } else {
    for (let neighbor of neighbors) {
      if (!path.includes(neighbor)) { // avoid cycles
        dfs(neighbor, graph, path, allPaths, leafNodes);
      }
    }
  }
  path.pop(); // backtrack
}
function branchExists(branches, newBranch) {
  return branches.some(b =>
    b.StartAt === newBranch.StartAt &&
    JSON.stringify(b.States) === JSON.stringify(newBranch.States)
  );
}

function buildSkeletonCodeForSubflow(allPaths , startNodeId , pipelineId , endNodes){
  var branches =[];
  // const startNode = canvasController.getNode(startNodeId, pipelineId);
  
  // console.log(startNode)
  
  allPaths.forEach(path=>{
    var code = {"StartAt" : "", "States": {}};
    const seen = new Set(); 

    for(var i=1 ; i < path.length ; i++){
      const node = canvasController.getNode(path[i], pipelineId);
      if (seen.has(node.id)) continue; // ✅ skip duplicates
        seen.add(node.id);
      //console.log(node);
      code.States[node.label] = {};
      code.States[node.label].Type = node.type;
      if(i===1){
        code.StartAt = node.label;
      }
      if(node.type ==="Wait")
          code.States[node.label]["Seconds"] = 5;
      // if(node.type==="Choice") {
        
      // } 
// if (node.type === "Choice") {
//         const choicesMeta = node.app_data?.choices || [];

//         code.States[node.label].Choices = choicesMeta.map(choice => {
//           const condition = {
//             Variable: choice.Variable || "$.value"
//           };

//           if (choice.Operator && choice.Value !== undefined) {
//             condition[choice.Operator] = choice.Value;
//           }

//           if (choice.Next) {
//             condition.Next = choice.Next;
//           }

//           return condition;
//         });

//         if (node.app_data?.default) {
//           code.States[node.label].Default = node.app_data.default;
//         }
//       }
      //////
      if(endNodes.has(node.id)){
        console.log(node.id);
        code.States[node.label]["End"] = true;
      }else{
        if(i< path.length-1 )
          code.States[node.label]["Next"] = canvasController.getNode(path[i+1], pipelineId).label;
      }
      setNodeParamsAndResource(node , code);
      //console.log(code);
    }
    if (!branchExists(branches, code)) {
    branches.push(code);
    }
    //branches.push(code);
    // const srcId = path[0];
    // console.log(srcId);
  });
  //console.log(branches);
  return branches;

}
function setNodeParamsAndResource(node , code){
  var taskParams = node.parameters;
  if(node.type==="Task" && taskParams) {
    if(taskParams.API_PARAMETERS)
      code.States[node.label].Parameters = taskParams.API_PARAMETERS;
    if(taskParams.Resource)
      code.States[node.label].Resource= taskParams.Resource;
    else 
      code.States[node.label].Resource = "";
  }
  
}

export const buildNext=(nodeJson , pipelineId)=>{
 var inputs = nodeJson.inputs[0];
// console.log(inputs.links);
 var linkId = inputs.links[0].id;
  var arr = canvasController.getLink(linkId, pipelineId);

  //console.log(arr);
  var linkobj = {
    "source": arr.srcNodeId,
    "target": arr.trgNodeId
  }
  //console.log(linkobj);
  var nextobj = {
    "id": inputs.links[0].node_id_ref,
    "next" : [nodeJson.id]
    }
   return linkobj;
};


export const getSourceObj=(arr, sourceId)=>{

//       You can first filter for the items you want, then map to get the specific property you are after.

// let a = [
//     {"listid":"1","tag":"ONE"},
//     {"listid":"1","tag":"TWO"},
//     {"listid":"1","tag":"THREE"},
//     {"listid":"2","tag":"ONE"},
//     {"listid":"2","tag":"TWO"},
//     {"listid":"3","tag":"ONE"}
// ]

// gives output of all items with same listid value 
  let filteredArr = arr.filter(item => item.source===sourceId).map(item => item.target);
  return filteredArr;
}


export const getNextObj=(arr, id)=>{
 // console.log(id);
 // console.log(JSON.parse(JSON.stringify(arr)));
  var ind = arr.findIndex(obj=> obj.id==id);
 // console.log(ind);
  if(ind !=-1 ){  
      var aobj = arr[ind];
      //arr.splice(ind, 1);
      console.log(aobj);
     // var obj = {"obj": aobj, "arr" : arr};
      return aobj;
  }
  // else{
  //   var obj = {"obj": {"id":id , "next": []}, "arr" : arr};
  //   return obj;
  // }
};




export const getNodeTypes = (arr, stateObj, idLabelsArray, srcNodeId, pipelineId)=>{
    console.log("get node types", arr.length);
    let len = arr.length;
    if(len==1){
       const trgLabel = getLabel(idLabelsArray , arr[0]);
       //stateObj.Type = "Task"
      if(stateObj.Type ==="Wait"){
        stateObj.Seconds = 5;
      }
       stateObj.Next = trgLabel;
        console.log("node type is task", stateObj);
      }else {
        
          if(stateObj.Type==='Choice'){
            console.log("node type is choice");
            console.log(stateObj);  
            //stateObj.Type = "Choice"  ;
            var choices = [];
           
                
                const branches= canvasController.getDownstreamNodes([srcNodeId], pipelineId);
                const links = branches.links[pipelineId];
                links.forEach(linkId=>{
                   const link = canvasController.getLink(linkId,  pipelineId);
                   console.log(link);
                  if(link.srcNodeId === srcNodeId){
                    const linkLabel = link.decorations[0].label;
                    const cond =linkLabel.split("==");
                    const trgLabel = getLabel(idLabelsArray , link.trgNodeId);
                    console.log(linkLabel);
                    var condValueType = "StringEquals"
                    var cvalue = cond[1];
                    if (!isNaN(cvalue)) {
                      cvalue = parseInt(cvalue);
                      condValueType = "NumericEquals"
                    }
                    var obj = {
                      "Next": trgLabel,
                      "Variable": cond[0],
                      [condValueType] : cvalue,
                    }
                    choices.push(obj);
                  }
              });
              
               
           
            stateObj.Choices = choices;
            stateObj.Default = getLabel(idLabelsArray , arr[0]);
        }
      }
      // case 3:{console.log("node type is parallel");
      //   stateObj.Type = "Parallel"  ;
      //   break;
      //}
  }

export const getLabel = ( idLabelsArray , id)=>{
    var label = "";
    idLabelsArray.forEach(function(element){
        //console.log(element);
            if(id==element.id){
            console.log(element.label);
            label = element.label;
        }    
      });
    return label;
}