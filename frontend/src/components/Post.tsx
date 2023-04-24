import React, {Fragment, useEffect, useMemo, useState} from "react";
import Card from "./Card";
import {Form} from "react-bootstrap";

import classes from './Post.module.css';
import {Button} from "react-bootstrap";
import {Comment} from "../classes/wallData";
import {Trash, X} from "react-bootstrap-icons";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {addComment, deletePost} from "../features/projects/projectWallSlice";
import {toast} from "react-toastify";

interface PostProps {
  id: string,
  content: string,
  title: string,
  author: string,
  comments?: Comment[],
  created: string,
  user: {
    sid: string,
    sub: string
  }
}

const Post: React.FC<PostProps> = ({id, user, content, title, author, comments, created}) => {
  const dispatch = useAppDispatch();
  const {activeProject} = useAppSelector(state => state.projects);
  const [showTextbox, setShowTextbox] = useState(false);
  const [commentContent, setCommentContent] = useState('');

  const formattedDate = useMemo(() => {
    const date = new Date(created);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString();
    return `${formattedDate} ${formattedTime}`;
  }, [created]);

  const showCommentsTextbox = () => {
    setShowTextbox(true)
  }

  const commentContentChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommentContent(e.currentTarget.value);
  }

  const handleDeletePost = () => {
    dispatch(deletePost({projectId: activeProject.id!, postId: id}));
    toast.info('Post deleted!');
  }

  const submitNewComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const commentBody: Comment = {
      projectId: activeProject.id,
      notificationId: id,
      content: commentContent,
      author: user.sub,
      userId: user.sid
    }

    dispatch(addComment(commentBody));

    setCommentContent('');
    setShowTextbox(false);
  }

  return (
    <Card classNames={classes.postCard}>
      <div>
        <span><b>{author}, </b></span>
        <span>{formattedDate}</span>
        <Trash onClick={handleDeletePost} size={30} style={{ float: 'right', cursor: 'pointer' }} />
      </div>
      <h4 style={{marginTop: '1rem'}}>{title}</h4>
      <p>{content}</p>
      {comments?.length! > 0 ?
        <Fragment>
          <h4>Comments:</h4>
          {comments?.map(comment => {
            return <p><b>{comment.author}</b>: {comment.content}</p>
          })}
        </Fragment> :
        <p className='text-secondary'>No comments</p>
      }

      {!showTextbox && <Button onClick={showCommentsTextbox}>Comment</Button>}
      {showTextbox &&
         <Form onSubmit={submitNewComment}>
            <Form.Group className="mb-3" controlId="commentContent">
                <Form.Control
                    as='textarea'
                    rows={3}
                    value={commentContent}
                    onChange={commentContentChanged}
                />
                <Button type='submit' className={classes.btn}>Post</Button>
            </Form.Group>
         </Form>
      }
    </Card>
  );
}

export default Post;