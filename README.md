# Firebase Email Link Authentication

** Live Example ** at [https://firebaselink.hightechtele.com](firebaselink.hightechtele.com)

## Summary

This code demonstrates implementation of 
[Authenticate with Firebase Anonymously Using JavaScript](https://firebase.google.com/docs/auth/web/anonymous-auth)
paired with 
[Authenticate with Firebase Using Email Link in JavaScript](https://firebase.google.com/docs/auth/web/email-link-auth).

Users can add an apple to their shopping cart without having authenticated. This functionality is enabled by creation of an anonymous 
account and corresponding Firestore record with realtime listener attached. 

Anonymous users can authenticate via an email link and have their shopping cart merged with their new authenticated account's cart 
via account linking, account deletion, and Firestore record deletion. 

> NOTE: An actual shopping cart implementation would likely include a cart field conatining the id of a cart which would be stored in a 
> separate collection, i.e., this is an oversimplified shopping cart implementation.

## Features
 - Account linking and Firestore record merging and finally deletion of orphaned account and record are explicitly coded. 
 - URL query parameters in the email link are consumed and quickly stripped / erased from the URL bar via JavaScript. 
 - Anonymous user accounts and associated Firestore records are orphaned upon signout, therefore we prompt anonymous users to confirm signout.

## Prerequisites

Firebase's Firestore, Hosting, and Authentication systems. 
This code utilizes the [async / await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) coding pattern 
therefore browser code shuold include a polyfill such as [Babel's polyfill.js](https://babeljs.io/docs/en/babel-polyfill#usage-in-browser).

### Installing

Paste your Firebase web project's specific configuration parameters into the top of the `script.js` file. 
Enable Anonymous and Email/Password authentication methods in your Firebase project. 
Edit the Action URL in the Authentication Template at firebase.google.com's Console. Strip off extraneous paths leaving the homepage only.

## Running the Implementation

Test the behavior of the authentication system.
 1. Sign in with no apples in cart.
 2. Close page/browser then return to page. Are you still signed in?
 3. Sign Out.
 4. While signed out, add an apple (or several) to your cart. Notice you are now signed in as anonymous.
 5. Try and sign out. Notice you are prompted that you will lose changes, i.e. your apples/cart if you signout.
 6. From the anonymous state with apples in your cart, click sign in. What is your user uid after you have authenticated?
 7. Check your Firebase Console. Are the orphaned user account and Firestore record deleted?
 8. Sign in while already signed in. Notice how nothing changes.
 9. Sign in (using same email) from another device. Are your apples there in your cart?

## Authors

* **High Tech Telecom LLC** - [High Tech Telecom LLC](https://hightechtele.com)

## License

It's free. No warranty. 