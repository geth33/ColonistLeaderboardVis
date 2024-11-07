import React, { useEffect, useRef, useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Divider from '@mui/material/Divider';
import './QuestionDropdown.css'; // Import CSS for styling


const QuestionDropdown= ({ question, answer }) => {
  return (
    <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          className='questionContainer'
        >
          {question}
        </AccordionSummary>
        <AccordionDetails className='answerContainer'>
          {answer}
        </AccordionDetails>
      </Accordion>
  );
};

export default QuestionDropdown;
