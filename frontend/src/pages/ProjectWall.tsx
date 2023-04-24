import Card from "../components/Card";
import React, {useEffect, useState} from "react";
import {Button, Form} from "react-bootstrap";
import Post from "../components/Post";
import {Comment, PostData} from '../classes/wallData'
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {createPost, getAllWallPosts} from "../features/projects/projectWallSlice";
import {getActiveProject} from "../features/projects/projectSlice";
import {parseJwt} from "../helpers/helpers";
import {useParams} from "react-router-dom";
import {toast} from "react-toastify";

const ProjectWall = () => {
  const params = useParams();
  const dispatch = useAppDispatch();
  const {wallPosts} = useAppSelector(state => state.projectWall);
  const {activeProject} = useAppSelector(state => state.projects);
  const [title, setTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [user, setUser] = useState({
    sub: '',
    sid: ''
  });

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("user")!).token;
    const userData = parseJwt(token);

    setUser(userData);
    dispatch(getActiveProject());
  }, []);

  useEffect(() => {
    dispatch(getAllWallPosts(activeProject.id!));
  }, [activeProject]);

  const postContentChanged = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostContent(e.currentTarget.value);
  }

  const postTitleChanged = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.currentTarget.value);
  }

  const submitNewPost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newPost: PostData = {
      title,
      postContent,
      author: user.sub,
      userId: user.sid,
      projectId: params.projectID!,
    };
    dispatch(createPost(newPost));
    toast.info('Post created!');
    setTitle('');
    setPostContent('');
  }

  return (
    <Card style={{marginTop: '1rem'}}>
      <h1 className='text-primary'>Project Wall</h1>

      {wallPosts.map((post, i) => {
        return <Post
                  key={i}
                  id={post.id!}
                  title={post.title}
                  content={post.postContent}
                  author={post.author}
                  created={post.created!}
                  comments={post.comments}
                  user={user}
              />
      })}
      <Form onSubmit={submitNewPost}>
        <Form.Group className="mb-3" controlId="postTitle">
          <Form.Label className='text-secondary'>Title</Form.Label>
          <Form.Control
            type='input'
            value={title}
            onChange={postTitleChanged}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="postContent" >
          <Form.Label className='text-secondary'>Write a new post</Form.Label>
          <Form.Control
            as='textarea'
            rows={3}
            value={postContent}
            onChange={postContentChanged}
          />
          <Button type='submit' disabled={postContent === ''} style={{ marginTop: '.5rem' }}>Post</Button>
        </Form.Group>
      </Form>
    </Card>

  );
}

export default ProjectWall;