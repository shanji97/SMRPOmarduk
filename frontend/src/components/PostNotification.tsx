import React, {Fragment, useEffect, useMemo, useState} from "react";

import {Card, Col, Form, Row} from "react-bootstrap";

import classes from './Post.module.css';
import {Button} from "react-bootstrap";
import {Trash, TrashFill, X} from "react-bootstrap-icons";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {addComment, deleteComment, deletePost} from "../features/projects/projectWallSlice";
import {toast} from "react-toastify";

interface PostProps {
  id: string,
  content: string,
  author: string,
  created: string,
  user: {
    sid: string,
    sub: string
  }
  approved: boolean
}



const PostNotification: React.FC<PostProps> = ({id, user, content, author, created, approved}) => {

  const formattedDate = useMemo(() => {
    const date = new Date(created);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString();
    return `${formattedDate} ${formattedTime}`;
  }, [created]);


/*
  const submitNewComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const commentBody: Comment = {
      projectId: activeProject.id,
      notificationId: id,
      content: commentContent,
      author: user.sub,
      userId: user.sid,
      approved: approved
    }

    dispatch(addComment(commentBody));

    setCommentContent('');
    setShowTextbox(false);
  }
*/

/* 

<Col>
              <Button variant="default" onClick={() => }>
                Cancel
              </Button>
             <Button variant="danger" onClick={() => }>
                Delete
              </Button>
            </Col>

*/

  return (
    <Card border={approved ? "info" : "danger"} className={classes.postCard}>
        <Card.Body>
          <Row>
            <Col>
              <div>
                <span><b>{author}, </b></span>
                <span>{formattedDate}</span>
              </div>
              <Card.Text>{content}</Card.Text>
            </Col>
            
            
          </Row>
          </Card.Body>
        </Card>
      );
  }

export default PostNotification;