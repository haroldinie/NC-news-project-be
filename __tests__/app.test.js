const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const db = require("../db/connection.js");
const request = require("supertest");
const app = require("../app.js");
const endPoints = require("../endpoints.json");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  db.end();
});

describe("GET /api/topics", () => {
  test("responds with an array of topic objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body).toHaveLength(3);
        body.forEach((topic) => {
          expect(topic).toMatchObject({
            description: expect.any(String),
            slug: expect.any(String),
          });
        });
      });
  });

  describe("GET: 404", () => {
    test("responds with 404 when incorrect spelling", () => {
      return request(app).get("/api/incorrectspelling").expect(404);
    });
  });

  describe("GET /api", () => {
    test("responds with object describing all available endpoints", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual(endPoints);
        });
    });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("responds with an article object with the correct properties", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body }) => {
        expect(body).toMatchObject({
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });
  test("GET:400, responds with status code and message when given invalid id", () => {
    return request(app).get("/api/articles/wrong").expect(400);
  });
  test("GET:404, responds with status code and message when given invalid id", () => {
    return request(app).get("/api/articlesss/3").expect(404);
  });
});
describe("GET /api/articles", () => {
  test("responds with an array of all articles", () => {
    return request(app)
      .get("/api/articles")
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(13);
        articles.forEach((article) => {
          expect(article).toMatchObject({
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            article_img_url: expect.any(String),
          });
        });
      });
  });
  test("resonds with array in desc order", () => {
    return request(app)
      .get("/api/articles")
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSorted({ descending: true });
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("responds with an array of comments for the given article_id", () => {
    return request(app)
      .get("/api/articles/5/comments")
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toHaveLength(2);
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: expect.any(Number),
          });
        });
      });
  });
  test("responds with array in desc order", () => {
    return request(app)
      .get("/api/articles/5/comments")
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toBeSorted({ descending: true });
      });
  });
  test("GET:400, responds with status code and message when given invalid id", () => {
    return request(app).get("/api/articles/wrong/comments").expect(400);
  });
  test("GET: 200, responds with empty array when artist_id is valid but no comments exists", () => {
    return request(app)
      .get("/api/articles/10/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toHaveLength(0);
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("Inserts the new comment and then responds with the posted comment", () => {
    const newComment = {
      author: "butter_bridge",
      body: "master blaster",
    };
    return request(app)
      .post("/api/articles/5/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment.author).toBe("butter_bridge");
        expect(body.comment.body).toBe("master blaster");
        expect(body.comment.article_id).toBe(5);
      });
  });
  test("Responds with the correct error code when key does not exist", () => {
    const newComment = {
      authorrr: "butter_bridge",
      body: "master blaster",
    };
    return request(app)
      .post("/api/articles/5/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid column value");
      });
  });
  test("Responds with the correct error code when username does not exist", () => {
    const newComment = {
      author: "butterrrr_bridge",
      body: "master blaster",
    };
    return request(app)
      .post("/api/articles/5/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid key value insert");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("update article with object inc_votes: newVote and returns updated article", () => {
    const patchVote = {
      inc_votes: 5,
    };
    return request(app)
      .patch("/api/articles/1")
      .send(patchVote)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: 105,
          article_img_url: expect.any(String),
        });
      });
  });
  test("update article with object inc_votes: newVote, returns updated article with negative number value", () => {
    const patchVote = {
      inc_votes: -150,
    };
    return request(app)
      .patch("/api/articles/1")
      .send(patchVote)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: -50,
          article_img_url: expect.any(String),
        });
      });
  });
  test("Responds with the correct error code when username does not exist", () => {
    const patchVote = {
      inc_votessss: 5,
    };
    return request(app)
      .patch("/api/articles/1")
      .send(patchVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid column value");
      });
  });
});

// 404 in the right place but thing doesnt exist - could exist but doesnt
// 400 mispel not even in right pplace in path - not a chnace it exists
