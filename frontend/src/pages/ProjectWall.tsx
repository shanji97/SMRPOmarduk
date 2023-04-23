import Card from "../components/Card";
import React, {useEffect, useState} from "react";
import {Button, Form} from "react-bootstrap";
import Post from "../components/Post";
import {PostData} from '../classes/wallData'
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {getAllWallPosts} from "../features/projects/projectWallSlice";

const ProjectWall = () => {
  const dispatch = useAppDispatch();
  const {wallPosts} = useAppSelector(state => state.projectWall);
  const [postContent, setPostContent] = useState('');

  useEffect(() => {
    // dispatch(getAllWallPosts());
  }, []);

  const postContentChanged = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostContent(e.currentTarget.value);
  }

  const submitNewPost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  }

  return (
    <Card style={{ marginTop: '1rem' }}>
      <h1 className='text-primary'>Project Wall</h1>

      {wallPosts.map((post, i) => {
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