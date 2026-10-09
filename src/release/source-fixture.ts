import { developerDeployment } from "../gitops/manifests-source.js";
export const repositoryUrl =
  "https://git.example.test/payments/payment-api.git";
export const sourceFiles: Record<string, string> = {
  "pom.xml": `<project xmlns="http://maven.apache.org/POM/4.0.0"><modelVersion>4.0.0</modelVersion><groupId>training</groupId><artifactId>payment-api</artifactId><version>1.8.2</version><properties><maven.compiler.release>17</maven.compiler.release><log4j.version>2.14.1</log4j.version></properties><dependencies><dependency><groupId>org.apache.logging.log4j</groupId><artifactId>log4j-core</artifactId><version>\${log4j.version}</version></dependency></dependencies><build><plugins><plugin><groupId>org.apache.maven.plugins</groupId><artifactId>maven-compiler-plugin</artifactId><version>3.13.0</version></plugin></plugins></build></project>\n`,
  Containerfile: `FROM registry.access.redhat.com/ubi9/openjdk-17 AS build\nUSER 0\nWORKDIR /tmp/src\nCOPY pom.xml .\nCOPY src ./src\nRUN mvn -B package dependency:copy-dependencies\nFROM registry.access.redhat.com/ubi9/openjdk-17-runtime\nWORKDIR /opt/app\nCOPY --from=build /tmp/src/target/classes ./classes\nCOPY --from=build /tmp/src/target/dependency ./lib\nUSER 1001\nEXPOSE 8080\nCMD ["java", "-cp", "classes:lib/*", "training.PaymentApi"]\n`,
  "src/main/java/training/PaymentApi.java": `package training;\nimport com.sun.net.httpserver.HttpServer;\nimport java.net.InetSocketAddress;\nimport org.apache.logging.log4j.LogManager;\npublic class PaymentApi { public static void main(String[] args) throws Exception {\n var server=HttpServer.create(new InetSocketAddress(8080),0);\n server.createContext("/health",exchange->{byte[] body="ok".getBytes();exchange.sendResponseHeaders(200,body.length);exchange.getResponseBody().write(body);exchange.close();});\n server.start();LogManager.getLogger(PaymentApi.class).info("payment-api started");\n}}\n`,
  "README.md": `# payment-api\nEdit pom.xml, inspect git diff, then git add, git commit and git push.\nThe release webhook uses only the pushed revision. A manual PipelineRun also fetches the remote revision; working-tree changes do not alter it.\n`,
};
sourceFiles["deploy/payment-api.yaml"] = developerDeployment;
export const repairedPom = sourceFiles["pom.xml"]
  .replace("<version>1.8.2</version>", "<version>1.8.3</version>")
  .replace(
    "<log4j.version>2.14.1</log4j.version>",
    "<log4j.version>2.17.1</log4j.version>",
  );
export const seedRevision = "574c7be5f45e4a8cd1f42766817623c6faf5faa2";
export const seedTree = "f24a964f519e537ce52f26bf987df0859ca15aa8";
export const seedTimestamp = 1791424800;
