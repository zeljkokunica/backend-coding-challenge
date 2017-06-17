Goal
====
Produce a simple web-app backend to complement the supplied front-end code.

The task
--------------


Imagine that you come back from 2 weeks of holidays on a Monday. On the team scrum board, assigned to you, two tasks await :


**User story 1:**

> **As a user, i want to be able to enter my expenses and have them saved for later.**

> _As a user, in the application UI, I can navigate to an expenses page. On this page, I can add an expense, setting :_

> 1. _The date of the expense_
> 0. _The value of the expense_
> 0. _The reason of the expense_

> _When I click "Save Expense", the expense is then saved in the database._
> _The new expense can then be seen in the list of submitted expenses._


**User story 2:**

> **As a user, I want to be able to see a list of my submitted expenses.**


> _As a user, in the application UI, i can navigate to an expenses page. On this page, I can see all the expenses I already submitted in a tabulated list.
> On this list, I can see :_

> 1. _The date of the expense_
> 0. _The VAT (Value added tax) associated to this expense. VAT is the UK’s sales tax. It is 20% of the value of the expense, and is included in the amount entered by the user._
> 0. _The reason of the expense_
>

By email, the front end developer of the team let you know that he already worked on the stories,  did build an UI and also went on holidays to France!

>_"Hi backEndDeveloper,_

>_Hope you had nice holidays.
>I did create an UI and prepared resources calls for those 2 user stories.
>You should only have to create the right endpoints in your service for the frontend application to call and everything should work fine!...
>Unless I forgot something of course, in which case you may be able to reach me on the beach_
>
>_PS. You can start the frontend by running `gulp` this will compile the code and launch a webserver on `localhost:8080`. You are free to host the files in your backend of course, then you will only need to build the source by running `gulp dev`. If you want to have a look at the code that is calling the endpoints then you can find this in `src/js/apps/codingtest/expenses/expenses-controller.js`_
>
>_PS II. In case you are stuck, you need to prep the project with `npm install -g gulp && npm install`. I'll leave it to you how to get Node on your system ;-)_
>
>_A bientôt !_
>
> _Robee_ & _Rinchen_
>"

Mandatory Work
--------------

Fork this repository. Starting with the provided HTML, CSS, and JS, create a Java-based REST API that:

1. Provides your solution to user story `1` and user story `2`
0. Alter the README to contain instructions on how to build and run your app.

Give our account `engagetech` access to your fork, and send us an email when you’re done. Feel free to ask questions if anything is unclear, confusing, or just plain missing.

Extra Credit
------------


_All the following work is optional. The described tasks do not need to be fully completed, nor do they need to be done in order.
You could chose to do the front-end part of a story, or the backend one, or only an endpoint of the backend one for example.
You could pick one to do completely or bits and pieces of the three, it is up to you as long as you explain to us what you did (or didn't) chose to do._


You finished way in advance and can't wait to show your work at Wednesday's demo session. But you decide to impress the sales team a bit more and go back to the team kanban board.
There you find some extra unassigned user stories :


**User story 3:**

> **As a user, I want to be able to save expenses in euros**

> _As a user, in the UI, when I write an expense, I can add the chars_ `EUR` _after it (example : 12,00 EUR).
> When this happens, the application automatically converts the entered value into pounds and save the value as pounds in the database.
The conversion needs to be accurate. It was decided that our application would call a public API to either realise the conversion or determine the right conversion rate, and then use it._

**User story 4:**

>**As a user, I want to see the VAT calculation update in real time as i enter my expenses**

> _After conversation with the dev team, we decided that the VAT should be calculated client-side as the user enters a new expense, before they save the expense to the database._
> _Robee being on holidays, Can I assign that to you backEndDeveloper?_


Questions
---------
##### What frameworks can I use?
That’s entirely up to you, as long as they’re OSS. We’ll ask you to explain the choices you’ve made. Please pick something you're familiar with, as you'll need to be able to discuss it.

##### What application servers can I use?
Anyone you like, as long as it’s available OSS. You’ll have to justify your decision. We use dropwizard and Tomcat internally. Please pick something you're familiar with, as you'll need to be able to discuss it.

##### What database should I use?
MySQL or PostgreSQL. We use MySQL in-house.

##### What will you be grading me on?
Elegance, robustness, understanding of the technologies you use, tests, security.

##### Will I have a chance to explain my choices?
Feel free to comment your code, or put explanations in a pull request within the repo. If we proceed to a phone interview, we’ll be asking questions about why you made the choices you made.

##### Why doesn’t the test include X?
Good question. Feel free to tell us how to make the test better. Or, you know, fork it and improve it!

Starting the service
--------------------
- build angular code (the output will go into service public path so that it's exposed alongside the service)
- cd expense-service
- open src/main/resources/application.properties and set the db properties 
- mvn clean package
- run service: java -jar target/expense-0.0.1-SNAPSHOT.jar --server.port=8080
- navigate to http://localhost:8080