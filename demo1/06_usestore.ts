import "dotenv/config";

import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { formatDocumentsAsString } from "langchain/util/document";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { LlmProviderManager } from './LlmProviderManager';
const model = await LlmProviderManager.getLlmProvider();
const embeddings = await LlmProviderManager.getEmbeddingsProvider();

const vectorStore = await FaissStore.load("./", embeddings);

const retriever = vectorStore.asRetriever();


const prompt =
  PromptTemplate.fromTemplate(`Answer the question based only on the following context:
{context}

Question: {question}`);


const chain = RunnableSequence.from([
  {
    context: retriever.pipe(formatDocumentsAsString),
    question: new RunnablePassthrough(),
  },
  prompt,
  model,
  new StringOutputParser(),
]);

let res = await chain.invoke("What is the Sorcerer's Stone?");
console.log(res);

res = await chain.invoke("Who is Norbert?");
console.log(res);
