 
 npm i
 rename .env-example to .env, provide your API_KEY and OPEN_API_KEY
 node prompt.js
 docker pull qdrant/qdrant
 docker run -p 6333:6333 qdrant/qdrant
 Comment out tests that you don't want to run and have fun.


 Search task.
 Install and run qdrant
 Create DB with 512 vectors
 Edit name of db in client calls
 Run node createEmbeddings.js it will populate your DB with vector data passed through model set in ./embeddings/index.js (you can edit it)
 Comment out line 145 with processInBatchesAndSaveToJSON();
 Uncomment line 146 and run it again.
 
 In first step results of creation of embeddings are stored in JSON file to provide you space to manipulate the DB Collection or the script without need of running out of cash in OpenAI each time you run the script
 Don't open the embeddings.json file because it's large and probably will cluster your RAM and hang editor.
 To inspect results you can console log in next step while straming from file.
 
 Second step is uploading your embeddings to vector DB, so if you'lll do uncommenting and rerun the sciprt it will add vectors.
 Inspect data consistency in DB by visualising it and going through imported data, if everything looks right, run:
 node prompt.js and it will execute elastic search on dataset.
 Have fun!
