
import React from "react";
import { IntlProvider } from "react-intl";
import AllTypesCanvas from "./test_resources/diagrams/allTypesCanvas.json";
import TestCanvas from "./test_resources/diagrams/test.json";
// import ModelerPalette from "./test_resources/palettes/modelerPalette.json";
// import FlowPalette from "./test_resources/palettes/flowPalette.json";
 //import TestPalette from "./test_resources/palettes/testPalette.json";
//import CustomPalatte from "./test_resources/palettes/customPalette.json";
import LeftPaletteMenu from "./test_resources/palettes/leftPaletteMenu";
import SampleASL from "./test_resources/aslfiles/sample.json";
import { CommonCanvas, CanvasController , CommonProperties} from "@elyra/canvas";


import {Button, Modal, TextInput, TextArea} from '@carbon/react'; 

//import {Add, Email} from '@carbon/icons-react';

import { transformToASL, getNodeTypes , createPipelineflowASL } from "./helpers/trasnformToASLhelpers";
//import { nodeTypes } from "./helpers/nodeTypes";


import JavascriptFileDownload from "js-file-download";
import JsonFileLoader from "./helpers/JSONFileLoader";


export let canvasController = "";
export const NodeFlowTypes = ["Task" ,"Wait" , "Pass" , "Succeed", "Fail", "Choice"]
class App extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
          showRightFlyout : false,
          rightFlyoutContent : null,
          readonly : false,
          commonCanvasConfig : {
            "enableMarkdownHTML": false,
            "enableLinkType": "Straight",
            // "enableEditingActions" : true,
            // "enableToolbarLayout" : true,
            // "enablePaletteLayout" : true,
           //"schemaValidation" : true,
            "enableNodeLayout": {
              "labelEditable": true
            }  
          },
          showPropertiesDialog : false,
          parameterDef : {},
          currentNodeId : "",
          currentPipelineId : "", 
          skeletonCode : {
            States : {}
          }
          
        };

        console.log("hello noopur's app");
        this.canvasController = new CanvasController();
        canvasController = this.canvasController;
        var readonly = false;
        // if(this.state.readonly===true){ 
        //   this.state.commonCanvasConfig.enableEditingActions = false
        //   this.state.commonCanvasConfig.enableDragWithoutSelect = true
        //   //this.state.commonCanvasConfig.enableToolbarLayout ="None"
        //   this.state.commonCanvasConfig.enablePaletteLayout = "None" 
        //   //this.state.commonCanvasConfig.enableStateTag="Locked" 
        //    this.state.commonCanvasConfig.enableAutoLayoutVerticalSpacing = true;
        // }
      
       var pipelineFlowfromSStorage =  JSON.parse(window.sessionStorage.getItem('pipelineFlow')) ;
       //console.log(pipelineFlowfromSStorage );
       var pipelineFlow = !pipelineFlowfromSStorage ? AllTypesCanvas : pipelineFlowfromSStorage;
       //var pipelineFlow = TestCanvas;
        this.canvasController.setPipelineFlow(pipelineFlow);
        window.sessionStorage.setItem('pipelineFlow' ,  JSON.stringify(pipelineFlow));
        //this.canvasController.setPipelineFlowPalette(ModelerPalette);
        //this.canvasController.setPipelineFlowPalette(FlowPalette);
        //this.canvasController.setPipelineFlowPalette(TestPalette);
        //this.canvasController.setPipelineFlowPalette(CustomPalatte);
        this.canvasController.setPipelineFlowPalette(LeftPaletteMenu);
   
       

        this.setPipelineFlow = this.setPipelineFlow.bind(this);
        this.getPipelineFlow = this.getPipelineFlow.bind(this);
        this.downloadPipelineFlow = this.downloadPipelineFlow.bind(this);

        this.contextMenuHandler = this.contextMenuHandler.bind(this);
        this.editActionHandler=  this.editActionHandler.bind(this);
       // this.contextMenuHandler2= this.contextMenuHandler2.bind(this);
       this.applyPropertyChanges = this.applyPropertyChanges.bind(this);
       this.closePropertiesDialog = this.closePropertiesDialog.bind(this);
     
        
        
    }
  
  // This is the correct hook to catch node creation
  beforeEditActionHandler= (data, editType) => {
   // console.log("beforedit",data, editType)
    if (data.editType === "createNode") {
      const newNode = data.nodeTemplate;
      const pipelineId = data.pipelineId;
      const existingNodes = this.canvasController.getNodes(pipelineId);

      // Count how many nodes of same op already exist
      const sameTypeCount = existingNodes.filter(n => n.type === newNode.type).length;
      console.log(sameTypeCount);
      // Create incremented label
      if(sameTypeCount>0){
      const baseLabel = newNode.label.replace(/\s\(\d+\)$/, "");
      newNode.label = `${baseLabel} (${sameTypeCount + 1})`;
      }
      // Return updated data
      return {
        ...data,
        data: newNode
      };
    }
    // For all other edit types, do nothing
    return data;
  }


  // convertDroppedItemToNode=(item)=>{
  //   console.log("dropped item", item)
  // }

    applyPropertyChanges= (propertySet, appData, additionalInfo, undoInfo, uiProperties) => {
        console.log(propertySet);
      const data = {
        propertySet: propertySet,
        appData: appData,
        messages: additionalInfo.messages,
        title: additionalInfo.title,
        uiProperties: uiProperties
      };
      const nodeId = this.state.currentNodeId;
      const pipelineId = this.state.currentPipelineId;
      const newLabel = additionalInfo.title;
      
      const node = this.canvasController.getNode(nodeId, pipelineId);
      //console.log(node);
      console.log("--------------------");
      this.canvasController.setNodeLabel(nodeId, newLabel);
      this.canvasController.setNodeParameters(nodeId, propertySet, pipelineId);
      this.setPipelineFlow();
      //const pipelineFlowJSON2 = this.getPipelineFlow();
      //console.log(pipelineFlowJSON2);

    };

    closePropertiesDialog= (source) =>{
      console.log("closing", source)     
      this.setState({ showRightFlyout : false });
      this.setState({currentNodeId: "" , currentPipelineId: ""});
      
    }
      
    
    editActionHandler(data, command) {
      if (data.editType === "editNode") {
         this.editNodeHandler(data);
      }
      if(data.editType=='setLabel'){
       
        this.editLinkHandler(data);         
      }
  }
 
  editLinkHandler=(data)=>{ 
    console.log("link editing", data);
 
    var linkId = data.id;
      var pipelineId = data.pipelineId;
      var targetLabel = data.targetObject.trgNode.label;
      console.log(targetLabel);
      var ifDeco = [
        {
          "id": "234",
          "label": targetLabel,
          "label_editable":true
        }
      ]
      this.canvasController.setLinkDecorations(linkId,ifDeco, pipelineId); 
      //var arr = this.canvasController.getNodes();
      //console.log(arr);

  };
  editNodeHandler = (data) => {

    console.log(data);
    const nodeId = data.id;
    const activePipelineId = data.pipelineId;
    const selectedNodeObj = data.selectedObjects[0];
    console.log(selectedNodeObj);

    const paramDef = selectedNodeObj.parameters;
    const label = selectedNodeObj.label;
    this.setState({currentNodeId : nodeId , currentPipelineId : activePipelineId});

    console.log("action: editNode", nodeId);
    console.log(paramDef);
    const pDefArray = [];
    var len = Object.keys(paramDef).length;
    if(selectedNodeObj.type==="Task"){   
     if(len===0){  
        pDefArray.push({
          "id":"API_PARAMETERS",
          "type": "array[string]"
          
        },
        {
          "id":"Resource",
          "type": "string"
        }
      );
      }else if(len===1){
        for (var key in paramDef){
          var value = paramDef[key];
          const obj = {
            "id":key,
            "type":"array[string]",
            "default":value,
          }
          pDefArray.push(obj);
          if(value==="API_PARAMETERS"){
            pDefArray.push(
              {
                "id":"Resource",
                "type": "string",
                "default": "",
              }
            );
          }
         else if(value==='Resource'){
            pDefArray.push(
              {
                "id":"API_PARAMETERS",
                "type": "array[string]",
              }
            );
          }
      }
      }else {
      
        for (var key in paramDef){
          const obj = {
            "id":key,
            "type":"array[string]",
            "default":paramDef[key], 
          };
          pDefArray.push(obj);
        }
      }
    }
    if(selectedNodeObj.type==='super_node' && (selectedNodeObj.app_data.node_asl_data && selectedNodeObj.app_data.node_asl_data.type==='Map')){
    // if(len===0){ 
    if(len > 0) {
     
      for (var key in paramDef){
          var value = paramDef[key];
          // console.log(value);
         
          const obj = {
              "id":key,
              "enum": [
                "Inline",
                "Distributed"
              ],
              "default": paramDef[key]
          }
          pDefArray.push(obj);
      } 
    }else {
      console.log("First time")
      pDefArray.push(
        {
          "id": "Mode", 
          "enum": [
            "Inline",
            "Distributed"
          ],
          "default": "Inline"
      }    
    );
    }
   
  
    console.log("Map properties" )
    }
    const  parameterDef = {
    "titleDefinition": {
      "title": label,
      "editable": true
    }, 
    "parameters" : pDefArray

    
  //   "parameters": [
  //     {
  //       "id":"Name",
  //       "type":"string",
  //       "default":paramDef.Name,
  //       "role":"textbox",
       
  //     },
  //     {
  //       "id":"id",
  //       "type":"string",
  //       "default":nodeId,
  //       "role":"textfield",
  //       "readonly" : true
  //     },
  //     {
  //       "id":"pipeline_id",
  //       "type":"string",
  //       "default":activePipelineId,
  //       "role":"textfield",
  //       "readonly" : true
  //     },
  //     {
  //       "id":"Type",
  //       "enum": [
  //         "Task",
  //         "Choice",
  //         "Fail",
  //         "SendEmail"
  //       ],
  //       "default": paramDef.Type
  //     },
  // ]
  };

  const propertiesInfo = {
    parameterDef: parameterDef,          // Required - Parameter definitions/hints/conditions
    //appData: "{user-defined}",                // Optional - User data returned in applyPropertyChanges
   // additionalComponents: "{components}",     // Optional - Additional component(s) to display
   // messages: messages,              // Optional - Node messages array
   // expressionInfo: this.expressionInfo,      // Optional - Information for expression builde
    initialEditorSize: "{small}"            // Optional - This value will override the value of
                                              // editor_size in uiHints. This can have a value of
                                              // "small", "medium", "large", or null
    //id: "{id}"                                // Optional - Unique parameter definition ID

  }

  const callbacks = {
    applyPropertyChanges: this.applyPropertyChanges,
    closePropertiesDialog: this.closePropertiesDialog
    
  }
    // Execute my action code here.
   const  rightFlyoutContent = (
      <div style={{display:"flex"}}>
          <CommonProperties
                    propertiesInfo={propertiesInfo}
                    propertiesConfig={{ containerType: "Custom", rightFlyout: true }}
                    callbacks={callbacks}
        />
      </div>
   );
    this.setState({
      rightFlyoutContent : rightFlyoutContent,
      showRightFlyout : true,
    });
    console.log("donw");

  }
    
  
  contextMenuHandler(source, defaultMenu) {
    if (source.type === "node") {
      console.log("////" , source.targetObject);
        let customMenu =  [
            { action: "deleteSelectedObjects", label: "Delete", toolbarItem: true },
            { divider: true, toolbarItem: true },
            //{ action: "editNode", label: "Edit properties" },
            { divider: true, toolbarItem: true },
            { action: "disconnectNode", label: "Disconnect" },
            { divider: true, toolbarItem: true },
            { action: "cut", label: "Cut" },
            { divider: true, toolbarItem: true },
            { action: "copy", label: "Copy" },
            { divider: true, toolbarItem: true },
            
            { action: "highlight" , label: "Highlight", submenu: true , 
              menu : [{action: 'highlightBranch', label: 'Highlight branch'},
                      {action: 'highlightUpstream', label: 'Highlight upstream'},
                      {action: "highlightDownstream",label: "Highlight downstream"},
                      { divider: true},
                      {action: 'unhighlight', label: 'Unhighlight'}
              ]
            }
        ];
        console.log("--d-",this.state.readonly);
        if(this.state.readonly===false){
          customMenu = customMenu.concat({ action: "editNode", label: "Edit properties"});
        }
        if(source.targetObject.type==='super_node' && !source.targetObject.app_data  ){
          console.log("nn", source.targetObject)
          customMenu = customMenu.concat({ action: "expandSuperNodeInPlace", label: "Expand ParallelFlow" });
         
        }
        if(source.targetObject.type==='Parallel'){
          customMenu = customMenu.concat({ action: "createSuperNode", label: "Create Parallel Flow"});

        }
        if(source.targetObject.app_data && source.targetObject.app_data.node_asl_data && source.targetObject.app_data.node_asl_data.type==='Map'){
          customMenu = customMenu.concat({ action: "expandSuperNodeInPlace", label: "Expand Map " });
         }
        return customMenu;
    }
    if(source.type=="link"){
      console.log( source);
      let customMenu = defaultMenu;
      
      customMenu = customMenu.concat({ action: "setLabel", label: "Set Label" });
      return customMenu;
    }
    return defaultMenu;
  }

    
    downloadPipelineFlow() {
    const pipelineFlow = this.getPipelineFlow();
      const canvas = JSON.stringify(pipelineFlow, null, 2);
      JavascriptFileDownload(canvas, "canvas.json");
    
    // SampleASL.States=({"Hello World":{"id":1, "type" : "task"}});  
    // console.log( SampleASL);
    //  const sampleASL = JSON.stringify(SampleASL, null,2);
    //  JavascriptFileDownload(sampleASL, "canvas.json");
    
        // create asl pipeline flow
    const canvasController = this.canvasController;
    const skeletonCode = this.state.skeletonCode;
    const pipelinesArr = pipelineFlow.pipelines;
    const pipeline = pipelineFlow.pipelines.find(p => p.id === pipelineFlow.primary_pipeline)
    createPipelineflowASL(pipeline, skeletonCode);
    // pipelinesArr.forEach(function(pipeline){
    //   console.log(pipeline); 
    // });
    console.log(skeletonCode);
    const codeASL = JSON.stringify(skeletonCode, null,2);
    JavascriptFileDownload(codeASL, "asl_code_generated_file.asl");
    console.log("Download is complete");
    }
     
    getPipelineFlow(canvController) {
      const canvasController = canvController ? canvController : this.canvasController;
      try {
        return canvasController.getPipelineFlow();
      } catch (err) {
        console.log("Schema validation error: " + err);
        return "Schema validation error";
      }
    }

    setPipelineFlow() {
      const pipelineFlow = this.getPipelineFlow();
  
      console.log("updated flow")
      this.canvasController.setPipelineFlow(pipelineFlow);
      window.sessionStorage.setItem('pipelineFlow' , JSON.stringify(pipelineFlow));
    }
   

   
    // propsInfo = {
    //   title: <FormattedMessage id={"dialog.nodePropertiesTitle"} />,
    //   messages: messages,
    //   parameterDef: properties,
    //   appData: appData,
    //   additionalComponents: additionalComponents,
    //   expressionInfo: expressionInfo,
    //   initialEditorSize: this.state.initialEditorSize
    // };
   
    importPipelineFlow(){

    }

    render() {
        return (
          
            <div >
              <IntlProvider locale="en">
              
              <Button  style={{marginLeft:1 , float: "right"}} onClick={()=> this.setPipelineFlow()} >Save </Button>
              
              <Button  style={{marginLeft:1 , float: "right"}} onClick={()=> this.downloadPipelineFlow()} >Download </Button>
              { <JsonFileLoader/> }
                
                <div id = "harness-app-container">
                <CommonCanvas
                    canvasController={this.canvasController}
                    contextMenuHandler={this.contextMenuHandler}
                    editActionHandler={this.editActionHandler}
                    beforeEditActionHandler={this.beforeEditActionHandler}
                    rightFlyoutContent={this.state.rightFlyoutContent}
                    showRightFlyout={this.state.showRightFlyout }
                    config={this.state.commonCanvasConfig}
                
                />
                </div>
                </IntlProvider>
                
            </div>
        );
    }
}

export default App;