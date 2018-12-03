# Firebase Email Link Authentication

This code demonstrates implementation of 
[https://firebase.google.com/docs/auth/web/email-link-auth](Authenticate with Firebase Using Email Link in JavaScript)
paired with 
[https://firebase.google.com/docs/auth/web/anonymous-auth](Authenticate with Firebase Anonymously Using JavaScript).

This code provides a basic test drive of the Firebase signin via email link procedure.

## Live Example

🌹 This code is configured and working against a test/development Firebase project that I have configured at 
[https://firebaselink.hightechtele.com](firebaselink.hightechtele.com).
            
### Prerequisites

Firebase's Firestore, Hosting, and Authentication systems. 

### Installing

Paste your Firebase web project's specific configuration parameters into the top of the `script.js` file. 
Enable Anonymous and Email/Password authentication methods in your Firebase project. 

## Running the Implementation

Note a few points:
 - Accounts are not automatically merged. In other words, the cart is lost on email link authentication signin.
 - We need to manually remove the parameters from the URL after user opens signin link.

## Authors

* **High Tech Telecom LLC** - *Initial work* - [High Tech Telecom LLC](https://hightechtele.com)

## License

It's free. No warranty. 