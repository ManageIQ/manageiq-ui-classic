//custom validator that makes sure attribute, association, and method names can only contain lowercase letters, numbers or underscores
const syntaxValidator = () => {
  var format = /[ `!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?~]/;
  return (value) => {
    if (value != value.toLowerCase() || format.test(value))
      return __(`Name can only contain lowercase letters, numbers, or underscores`);
  };
};

//custom validator that checks any uploaded files to see if they meet the requirements
const fileValidator = ({ maxSize }) => {
  return (value) => {
    const imageTypes = /image\/jpg|image\/jpeg|image\/png|image\/svg/;

    if (value === undefined) {
      return null;
    }

    if (value && value.inputFiles[0] && !imageTypes.test(value.inputFiles[0].type))
      return sprintf(__(`File must be an image of type "png", "jpg/jpeg", or "svg". The currently uploaded file's extension is "%s"`), value.inputFiles[0].type.split('/').pop());

    if (value && value.inputFiles[0] && value.inputFiles[0].size > maxSize) {
      const fileSize = value.inputFiles[0].size;
      return sprintf(
        n__(
          `File is too large, maximum allowed size is %s bytes. Current file has %s byte`,
          `File is too large, maximum allowed size is %s bytes. Current file has %s bytes`, 
          fileSize
        ), 
        maxSize, fileSize);
    }
  };
};

const validMapper = {
  'file': fileValidator,
  'syntax': syntaxValidator,
};

export default validMapper;
