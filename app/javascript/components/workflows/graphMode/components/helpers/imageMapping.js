const contextPath = "/images/";

const svgMappings={
    "choice":"choices.svg",
    "task":"task.svg",
    "succeed": "success_filled.svg",
     "wait":"wait_time.svg" , 
     "fail": "failure_filled.svg",
     "pass":"pass.svg" , 
     "parallel":"parallel.svg" ,
     "map":"map_new.svg"
};

export const getImagePath=(key)=>{
    let path = contextPath+svgMappings[key.toLowerCase()];
    //console.log(path)
    return path;

}