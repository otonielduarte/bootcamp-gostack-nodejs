const express = require("express");
const cors = require("cors");

const { v4: uuid, validate: isUuid } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

const validateModel = (req, resp, next) => {
  const { title, url, techs } = req.body;
  if (!title || !url || !techs || techs.length === 0) {
    return resp.status(400).json({ error: "Malformated json" })
  }
  return next();
}

const validateUuid = (req, resp, next) => {
  const { id } = req.params;
  if (!isUuid(id)) {
    return resp.status(400).json({ error: "Invalid uuid" });
  }
  return next();
}

app.use("/repositories/:id", validateUuid);

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", validateModel, (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  };

  repositories.push(repository);

  return response.status(201).json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const repoIndex = repositories.findIndex(element => element.id === id);
  if(repoIndex < 0) {
    return response.status(400).json({error: "Not found"})
  }

  const { title, url, techs } = request.body;
  const repository = {
    ...repositories[repoIndex],
    title,
    url,
    techs,
  };
  repositories[repoIndex] = repository;

  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const repoIndex = repositories.findIndex(element => element.id === id);
  if(repoIndex < 0) {
    return response.status(400).json({error: "Not found"})
  }

  repositories.splice(repoIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;
  const repository = repositories.find(element => element.id === id);
  if(!repository) {
    return response.status(400).json({error: "Not found"})
  }
  repository.likes++;
  return response.json(repository);
});

module.exports = app;
