# TaskList

A simple tasklist app written in React, using Vite and Firebase (auth and realtime database). Built for a local law firm who needed a fast solution to replace a tool they lost access to.

## Feedback

> <p style="color: canvastext">Isaac Maddox made my life (and my co-workers’) much easier by creating this program for our tasks. Managing everything is a lot of work, and when we lost our previous task list, we were all in a panic. Mr. Maddox truly came to the rescue with this solution. The new task list is also very easy to navigate and is a huge improvement over the old one we used in our previous email program.</p>
>
> &ndash; <em>Haley</em>, employee at the law firm

> <p style="color: canvastext">After our firm's conversion to Windows 11, we quickly discovered that Outlook's Task Program no longer fit our team's needs. Gone were the days of a simple, easy to use system just listing a task by deadline, being able to mark completion, flag it for importance, etc. Isaac Maddox learned of our struggles, listened to what we needed as a group, and rapidly built a program designed with us in mind. After Beta testing the new program, he quickly and efficiently implemented a few design suggestions, and we were able to launch before any of us thought possible. Isaac Maddox saved our team a lot of headaches and additional unnecessary stress by listening to our needs and designing a program that worked for us and hectic schedules. I would highly recommend him for your programming needs.</p>
>
> &ndash; <em>Amanda</em>, employee at the law firm

## Technologies

### Vite (React + SWC)

I used Vite to build this app. I wanted a client-side solution to avoid extra overhead and to ensure the app worked as fast as possible. Vite was a good choice for this project as it support fully client-side applications and makes the development experience a breeze.

### React Router

Since this application is fully client-side, I had to find a solution to allow for dynamic routing. The obvious choice was React Router. It is very widely used, I know it well, and the developer experience is amazing with it.

### Firebase (auth and realtime database)

I chose to use Firebase for this project mainly because it supports real-time operations. The pricing structure is also fair and cheap, meaning the client should not have to pay much to maintain this app. Having the auth and database in one place made it super easy to establish security rules that protect the data and ensure that nothing is modified without permission.

### Netlify

I use Netlify to host this application. Because Netlify is a serverless hosting platform and the application is fully client-side, the only bandwidth used is on initial page load. After that, all traffic is between the client computer and the Firebase servers. This means that as long as the app is in use, there should be no costs incurred to host it.

### Sentry

I implemented Sentry into this application to report errors as they happen. This way, if a critical error occurs while the app is in use I will be notified and can fix it as soon as I am able to. This app is critical to the law firm's daily operations and needs to be fixed with urgency should anything break.

### Shadcn + Tailwind

To speed up the develompent process, I opted to use Shadcn for the UI library. Its pre-developed and customizable components ensure that accessibility is up to par and that the app looks clean and presentable through daily use. I chose to use Tailwind because I believe it pairs with React develompent very well.

## Development Style

Initially, this app was written very quickly and I was not happy with how the code turned out. Although it worked very well, I had database code scattered throughout the app which would make it very difficult to modify this implementation should the need arise in the future.

To solve this problem, I chose to implement a service layer that is responsible for all database interaction. I also use a React context provider to house all the operations that are then used throughout the app. By using a service layer, I provide myself the opportunity to swap out the database implementation in the future should I need to.
