import SwaggerParser from "@apidevtools/swagger-parser";
import path from "path";

const loadSwaggerDocument = async () => {
  const openApiPath = path.resolve(process.cwd(),"docs/openapi.yaml");
  const swaggerDocument = await SwaggerParser.bundle(openApiPath);
  return swaggerDocument;
};

export default loadSwaggerDocument;
