// ASL to Elyra Canvas Converter (Refactored with helper functions)
import { v4 as uuidv4 } from 'uuid';
import { getImagePath } from "./imageMapping";
// ASL to Elyra Canvas Converter (Refactored with helper functions)

//export // ASL to Elyra Canvas Converter (Refactored with helper functions)

export function aslToElyraCanvas(stateMachine, pipeline_id) {
  const { States, StartAt } = stateMachine;
  const pipelines = [];
  const nodes = [];
  const idMap = {};
  let idCounter = 1;

  const getYPos = () => (idCounter++) * 40;

  const createPort = (label) => [{
    id: "inPort",
    app_data: {
      ui_data: {
        label,
        cardinality: { min: 1, max: 1 }
      }
    }
  }];

  const createLink = (sourceId, targetId) => ({
    id: `link-${sourceId}-${targetId}`,
    node_id_ref: sourceId
  });

  function createNode(stateName, state, isFirst) {
    const nodeId = uuidv4();
    const image = getImagePath(state.Type);
    const cardinality = getOutputCardanility(state.Type);
    console.log(cardinality);
    return {
      id: nodeId,
      op: state.Type.toLowerCase(),
      type: state.Type,
      inputs: isFirst ? createPort("Input Port") : [{ links: [] }],
      outputs: [{
        id: "outPort",
        app_data: {
          ui_data: {
            label: "Output Port",
            cardinality: { min: cardinality.min, max: cardinality.max }
          }
        }
      }],
      app_data: {
        ui_data: {
          label: stateName,
          image,
          x_pos: 100,
          y_pos: getYPos()
        }
      }
    };
  }

function getOutputCardanility(type){
    const typeVal = type.toLowerCase();
    switch(typeVal){
        case "choice":
        case "parallel" : 
            return {min : 2 , max :100};
        case "map":
            return {min : 1 , max :2};
        case "task"  :
        case "pass" :
        case "wait" :
            return {min : 1 , max :1};
        case "succeed":
        case "fail" :  
            return {min : 0 , max :0};        
    }
    
}
  const createSubflowPipeline = (pipeline_id_ref, nodes) => ({
    id: pipeline_id_ref,
    nodes,
    app_data: { ui_data: { comments: [] } }
  });

  function processMapNode(stateName, state) {
    const subPipelineId = uuidv4();
    const mapNode = createNode(stateName, state, stateName === StartAt);
    mapNode.subflow_ref = { pipeline_id_ref: subPipelineId };
    mapNode.type = "super_node";
    mapNode.op = "map";
    mapNode.app_data.node_asl_data = { type: "Map" };

    const subflow = aslToElyraCanvas({
      States: state.ItemProcessor.States,
      StartAt: state.ItemProcessor.StartAt
    }, subPipelineId);
    pipelines.push(...subflow.pipelines);

    return mapNode;
  }

  function processParallelNode(stateName, state) {
    const wrapperPipelineId = uuidv4();
    const wrapperNodes = [];
    const parallelNodeIdMap = {};

    const inBindingId = uuidv4();
    const parallelNodeId = uuidv4();
    const outBindingId = uuidv4();

    wrapperNodes.push({
      id: inBindingId,
      type: "binding",
      op: "Binding",
      outputs: [createPort("Binding port for supernode")[0]],
      inputs:[],
      app_data: {
        ui_data: {
          label: "Binding",
          x_pos: 100,
          y_pos: getYPos(),
          description: "Supernode binding node"
        }
      }
    });

    wrapperNodes.push({
      id: parallelNodeId,
      type: "Parallel",
      op: "parallel",
      inputs: [{ links: [createLink(inBindingId, parallelNodeId)] }],
      outputs: [{id: "outPort",app_data: {ui_data: {cardinality: { min: 2,max: 100},label: "Output Port"} } }],
      app_data: {
        ui_data: {
          label: "Parallel",
          x_pos: 300,
          y_pos: getYPos(),
          description: "Parallel node",
          image: getImagePath("Parallel"),
        }
      }
    });

    wrapperNodes.push({
      id: outBindingId,
      type: "binding",
      op: "Binding",
      inputs: [{ links: [createLink(parallelNodeId, outBindingId)] }],
      app_data: {
        ui_data: {
          label: "Binding",
          x_pos: 500,
          y_pos: getYPos(),
          description: "Supernode binding node"
        }
      }
    });

    state.Branches.forEach(branch => {
      const { StartAt } = branch;
        let count=1;
      Object.entries(branch.States).forEach(([bStateName, bState]) => {
        const branchNodeId = uuidv4();
        parallelNodeIdMap[bStateName] = branchNodeId;
        const card = getOutputCardanility(bState.Type);
        wrapperNodes.push({
          id: branchNodeId,
          type: bState.Type,
          op: bState.Type,
          inputs: [{ links: [] }],
          outputs:[{id: "outPort",app_data: {ui_data: {cardinality: card}}}],
          app_data: {
            ui_data: {
              label: bStateName,
              image: getImagePath(bState.Type),
              x_pos: count++ * 80,
              y_pos: getYPos()
            }
          }
        });
      });

      Object.entries(branch.States).forEach(([bStateName, bState]) => {
        const sourceId = parallelNodeIdMap[bStateName];
        const addLink = (targetName) => {
          const targetId = parallelNodeIdMap[targetName];
          if (targetId) {
            const link = createLink(sourceId, targetId);
            wrapperNodes.find(n => n.id === targetId)?.inputs[0].links.push(link);
          }
        };

        bState.Branches?.forEach(br => addLink(br.StartAt));
        if (bState.Next) addLink(bState.Next);

        const startTargetId = parallelNodeIdMap[StartAt];
        if (startTargetId) {
          wrapperNodes.find(n => n.id === startTargetId)?.inputs[0].links.push(createLink(parallelNodeId, startTargetId));
        }
      });
    });

    pipelines.push(createSubflowPipeline(wrapperPipelineId, wrapperNodes));

    const superNodeId = uuidv4();
    return {
      id: superNodeId,
      type: "super_node",
      op: "parallelWrapper",
      inputs: [{
        links: [],
        subflow_node_ref: inBindingId
      }],
      outputs: [{
        id: "outPort",
        subflow_node_ref: outBindingId,
        app_data: {
          ui_data: {
            label: "Output Port",
            cardinality: { min: 1, max: 1 }
          }
        }
      }],
      subflow_ref: { pipeline_id_ref: wrapperPipelineId },
      app_data: {
        ui_data: {
          label: `super_${stateName}`,
          image: "useDefaultIcon",
          is_expanded: true,
          x_pos: 300,
          y_pos: getYPos()
        }
      }
    };
  }

  const connectStates = () => {
    for (const [stateName, state] of Object.entries(States)) {
      const sourceId = idMap[stateName];
      const addLink = (targetName) => {
        const targetId = idMap[targetName];
        if (targetId) {
          const link = createLink(sourceId, targetId);
          nodes.find(n => n.id === targetId)?.inputs[0].links.push(link);
        }
      };

      switch (state.Type) {
        case "Choice":
          state.Choices?.forEach(choice => addLink(choice.Next));
          if (state.Default) addLink(state.Default);
          break;
        case "Map":
        case "Pass":
        case "Task":
        case "Wait":
        case "Succeed":
        case "Fail":
        case "Parallel":    
          if (state.Next) addLink(state.Next);
          break;
      }
    }
  };

  for (const [stateName, state] of Object.entries(States)) {
    let node;
    if (state.Type === "Map" && state.ItemProcessor) {
      node = processMapNode(stateName, state);
    } else if (state.Type === "Parallel") {
      node = processParallelNode(stateName, state);
    } else {
      node = createNode(stateName, state, stateName === StartAt);
      setTaskParamsAndResource(node, state , node.type==="Task");
    }
    nodes.push(node);
    idMap[stateName] = node.id;
  }

  connectStates();

  pipelines.push({
    id: pipeline_id,
    nodes,
    app_data: { ui_data: { comments: [] } }
  });

  return { pipelines };
}

function setTaskParamsAndResource(node, aslState , isTask){
   if(!isTask) return;
    const elyraParams = {};

  // 1. Handle Resource
  if (aslState.Resource) {
    elyraParams["Resource"] = aslState.Resource;
  }

  // 2. Handle Parameters
  if (aslState.Parameters) {
    for (const [key, val] of Object.entries(aslState.Parameters)) {
      // Convert arrays of objects into JSON strings (Elyra convention)
      if (Array.isArray(val) && typeof val[0] === "object") {
        elyraParams[key] = val.map(item => JSON.stringify(item));
      } else {
        elyraParams[key] = val;
      }
    }
  }
  node.parameters = elyraParams;
  console.log(node,elyraParams);

    
}
