import React, {useEffect, useMemo, useState} from "react";
import Card from "./Card";
import {Form} from "react-bootstrap";

import classes from './Post.module.css';
import {Button} from "react-bootstrap";

interface PostProps {
  content: string,
  author: string,
  comments?: string[],
  created: string
}

const Post: React.FC<PostProps> = ({content, author, comments, created}) => {
  const [showTextbox, setShowTextbox] = useState(false);
  const [commentContent, setCommentContent] = useState('');

  const formattedDate = useMemo(() => {
    const date = new Date(Number(created));
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

  const submitNewComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(commentContent);

    setShowTextbox(false);
  }

  return (
    <Card classNames={classes.postCard}>
      <span><b>{author}, </b></span>
      <span>{formattedDate}</span>
      <p>{content}</p>
      {/* TODO show comments*/}
      {showTextbox &&
        <Form.Group className="mb-3" controlId="commentContent" onSubmit={submitNewComment}>
            <Form.Control
                as='textarea'
                rows={3}
                value={commentContent}
                onChange={commentContentChanged}
            />
            <Button type='submit' className={classes.btn}>Post</Button>
        </Form.Group>
      }
      {!showTextbox && <Button onClick={showCommentsTextbox}>Comment</Button>}

    </Card>
  );
}

export default Post;