import React, {useEffect, useMemo, useState} from "react";
import Card from "./Card";
import {Form} from "react-bootstrap";

import classes from './Post.module.css';
import {Button} from "react-bootstrap";
import {Comment} from "../classes/wallData";
import {X} from "react-bootstrap-icons";

interface PostProps {
  content: string,
  author: string,
  comments?: Comment[],
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

  const handleDeletePost = () => {
    console.log('delete')
  }

  const submitNewComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(commentContent);
    setCommentContent('');
    setShowTextbox(false);
  }

  return (
    <Card classNames={classes.postCard}>
      <div>
        <span><b>{author}, </b></span>
        <span>{formattedDate}</span>
        <X onClick={handleDeletePost} size={30} style={{ float: 'right', cursor: 'pointer' }} />
      </div>

      <p>{content}</p>
      <h4><b>Comments:</b></h4>
      {comments?.map(comment => {
        return <p><b>{comment.author}</b>: {comment.content}</p>
      })}
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