import Card from "../components/Card";
import React, {useState} from "react";
import {Button, Form} from "react-bootstrap";
import Post from "../components/Post";
import {PostData} from '../classes/wallData'

const DUMMY_POSTS: PostData[] = [
  {
    postContent: 'Izgradnja novega tobogana',
    author: 'tinec',
    created: Date.now().toString(),
    comments: [],
  },
  {
    postContent: 'Nov park',
    author: 'mlapajne',
    created: Date.now().toString(),
    comments: ['kr neki']
  },
  {
    postContent: 'Izgradnja novega igrisca',
    author: 'simonk',
    created: Date.now().toString()
  }
];

const ProjectWall = () => {
  const [postContent, setPostContent] = useState('');

  const postContentChanged = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostContent(e.currentTarget.value);
  }

  const submitNewPost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  }

  return (
    <Card style={{ marginTop: '1rem' }}>
      <h1 className='text-primary'>Project Wall</h1>

      {DUMMY_POSTS.map((post, i) => {
        return <Post
                  key={i}
                  content={post.postContent}
                  author={post.author}
                  created={post.created}
                  comments={post.comments}
              />
      })}

      <Form.Group className="mb-3" controlId="postContent" onSubmit={submitNewPost}>
        <Form.Label className='text-secondary'>Write a new post</Form.Label>
        <Form.Control
          as='textarea'
          rows={3}
          value={postContent}
          onChange={postContentChanged}
        />
        <Button type='submit' disabled={postContent === ''} style={{ marginTop: '.5rem' }}>Post</Button>
      </Form.Group>
    </Card>

  );
}

export default ProjectWall;