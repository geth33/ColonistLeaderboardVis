// src/FAQ.js
import React from 'react';
import QuestionDropdown from '../Components/FAQ/QuestionDropdown'

const FAQ = () => {
  return (
    <div className='faq' style={{background: '#2b77c6'}}>
      <h1>Frequently Asked Questions</h1>
      <div>
        <h3 className='faqSection'>General</h3>
        <QuestionDropdown question={"Is this app made by the Colonist.io team?"} answer={"No. This is a fan-made third-party app."}/>
        <QuestionDropdown question={"Why isn't the the app up-to-date with the latest Colonist data?"} answer={"I haven't automated this process yet. I will update the data three times throughout each season."}/>
        <QuestionDropdown question={"Why does the data for Season 10 look incomplete?"} answer={"Season 10 should be the only season with incomplete data due to an error in the script that collects the data. The issue is now fixed. There's potential the missing data can be amended if the Colonist team wants to collaborate on the project."}/>
        <QuestionDropdown question={"Is this app free?"} answer={`100%. This is a labor of love for the Colonist community that I'm paying out of pocket for. All I ask is that you give me some feedback so I can continue to make it great for everyone!`}/>
        <QuestionDropdown question={"Can I give suggestions or report bugs?"} answer={`Absolutely! Please click the "Give Feedback" link in the website's navigation bar. Alternatively, reach out to me (geth9886) on Discord. All feedback is welcome.`}/>
        <h3 className='faqSection'>About</h3>
        <QuestionDropdown question={"Who made this app?"} answer={`Hi! My tag on Colonist is TofuTyrant and I'm a top 50 player in 1v1 and top 100 player in base. I'm a full-stack web developer from Utah with a love for data visualizations.`}/>
        <QuestionDropdown question={"Why did you make this app?"} answer={`I love uncovering the hidden story behind data. I was inspired by abacaba's "The history of the top chess players over time" video on YouTube and I felt like I could do something similar for the Colonist leaderboards.`}/>
        <QuestionDropdown question={"How did you make this app?"} answer={`This is a react application that uses D3.js for graphing and MUI for general UI components. I scrape the data from Colonist's leaderboards and store that data in a PostgreSQL DB in Cloud SQL. This website is hosted by GCP.`}/>
        <QuestionDropdown question={"Can I help work on the project?"} answer={`I'm currently keeping the project private but I'm open to having others work on it. I think the app could definitely use a designer. Reach out to me on Discord (geth9886).`}/>

      </div>
    </div>
  );
};

export default FAQ;
