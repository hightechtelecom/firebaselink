(function() {
    // Initialize Firebase WITH YOUR PROJECT PARAMETERS
    var config = {
        apiKey: "YourApiKeyGoesHere",
        authDomain: "your-auth-domain.firebaseapp.com",
        databaseURL: "https://your-project.firebaseio.com",
        projectId: "your-project",
        storageBucket: "your-project.appspot.com",
        messagingSenderId: "1234567890"
    };
    var firebase = window.firebase;
    firebase.initializeApp(config);
    firebase.firestore().settings({timestampsInSnapshots: true});
    var db = firebase.firestore();
    
    var signInButton = document.getElementById("sign-in-button");
    var signOutButton = document.getElementById("sign-out-button");
    var signinSubmitButton = document.getElementById("signin-submit-button");
    var addAppleToCartButton = document.getElementById("add-apple-button");
    
    if(signinSubmitButton){
        signinSubmitButton.addEventListener('click', function(e) {
            if(document.getElementById("email-input").checkValidity()){
                var emailAddress = document.getElementById("email-input").value;
                document.getElementById("signup-email-address-span").innerText = emailAddress;
                document.getElementById("signup-enter-email-div").classList.remove("signup-body-displayed");
                document.getElementById("signup-check-email-div").classList.add("signup-body-displayed");
                
                var actionCodeSettings = {
                    // URL you want to redirect back to. The domain (www.example.com) for this
                    // URL must be whitelisted in the Firebase Console.
                    url: 'https://firebase.hightechtele.com',
                    // This must be true.
                    handleCodeInApp: true
                };
                
                firebase.auth().sendSignInLinkToEmail(emailAddress, actionCodeSettings).then(function() {
                    // The link was successfully sent. Inform the user.
                    // Save the email locally so you don't need to ask the user for it again
                    // if they open the link on the same device.
                    window.localStorage.setItem('emailForSignIn', emailAddress);
                }).catch(function(error) {
                    // Some error occurred, you can inspect the code: error.code
                });
            }
        });
    }
    if(addAppleToCartButton){
        addAppleToCartButton.addEventListener('click', function(e) {
            //add apple to this users cart
            var userObj = {};
            userObj.apples = 1;
            console.log("addAppleToCartButton clicked");
            if(!firebase.auth().currentUser){
                //SIGN IN ANONYMOUSLY
                firebase.auth().signInAnonymously().then(function(firebaseUserObj) {
                    userObj.created = Date.now();
                    //CREATE USER DOC
                    return db.collection("users").doc(firebaseUserObj.user.uid).set(userObj).then(function () {
                        //Apple is now in users cart
                        //Attach listener to user document
                    }).catch(function (error) {
                        console.log("Error adding apple to cart. Error: " + error);
                    });
                }).catch(function(error) {
                    console.log(error.message);
                });
            } else {
                //USER ALREADY SIGNED IN
                db.collection("users").doc(firebase.auth().currentUser.uid).get().then(function(userDoc) {
                    if (userDoc.exists) {
                        if(userDoc.data().apples){
                            userObj.apples = userDoc.data().apples + 1;
                        }
                        userObj.updated = Date.now();
                        //now update 
                        return db.collection("users").doc(firebase.auth().currentUser.uid).update(userObj);
                    } else {
                        userObj.created = Date.now();
                        return db.collection("users").doc(firebase.auth().currentUser.uid).set(userObj);
                    }
                }).catch(function(error) {
                    console.log("Error getting user document:", error);
                });
            }
        });
    }
    firebase.auth().onAuthStateChanged(function(user) {
        if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
            signInWithEmailLinkHandler();
        }
        console.log(".onAuthStateChanged fired");
        if (user) {
            console.log("user seen by onAuthStateChanged");
            updateUserText();
            

            
            db.collection("users").doc(user.uid).onSnapshot(function (userDoc) {
                console.log(".onSnapshot fired");
                updateUserText();
                if(document.getElementById("user-apple-count-span")){
                    if (userDoc.exists) {
                        if(userDoc.data().apples) {
                            document.getElementById("user-apple-count-span").innerText = userDoc.data().apples;
                        }
                    } else {
                        document.getElementById("user-apple-count-span").innerText = "none";
                    }
                }
                if(document.getElementById("is-anonymous-span")){
                    document.getElementById("is-anonymous-span").classList.remove("hidden");
                    document.getElementById("user-email-span").classList.remove("hidden");
                    document.getElementById("user-apple-count-span").classList.remove("hidden");     
                }
            });
        } else {
            // User is signed out.
            console.log("no user detected by onAuthStateChanged");
            updateUserText();
        }
    });
    
    if(signInButton){
        signInButton.addEventListener('click', function(e) {
            window.location.href = "/signin";
        });
    }
    if(signOutButton){
        signOutButton.addEventListener('click', function(e) {
            if(firebase.auth().currentUser){
                //detach listener
                db.collection("users").doc(firebase.auth().currentUser.uid).onSnapshot(function () {});
                firebase.auth().signOut();
            }
        });
    }
    function updateUserText(){
        if(window.location.pathname==="/"){
            if(firebase.auth().currentUser){
                document.getElementById("is-anonymous-span").innerText = firebase.auth().currentUser.isAnonymous;
                document.getElementById("user-uid-span").innerText = firebase.auth().currentUser.uid;
                if(firebase.auth().currentUser.email){
                    document.getElementById("user-email-span").innerText = firebase.auth().currentUser.email;
                } else {
                    document.getElementById("user-email-span").innerText = "none";
                }
            } else {
                document.getElementById("user-uid-span").innerText = "No user";
                document.getElementById("is-anonymous-span").innerText = "No user";
                document.getElementById("user-email-span").innerText = "";
                document.getElementById("user-apple-count-span").innerText = "";            
            }
        }
    }
    function signInWithEmailLinkHandler(){
        console.log("signInWithEmailLinkHandler fired");

        // Additional state parameters can also be passed via URL.
        // This can be used to continue the user's intended action before triggering
        // the sign-in operation.
        // Get the email if available. This should be available if the user completes
        // the flow on the same device where they started it.
        var email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
            // User opened the link on a different device. To prevent session fixation
            // attacks, ask the user to provide the associated email again. For example:
            email = window.prompt('Please provide your email for confirmation');
        }
        
        // Construct the email link credential from the current URL.
        var credential = firebase.auth.EmailAuthProvider.credentialWithLink(email, window.location.href);
        
        //IF THERE IS A CURRENT USER, LINK TO IT, ELSE COMPLETE SIGN IN
        
        // Link the credential to the current user.
        if(firebase.auth().currentUser){
            firebase.auth().currentUser.linkAndRetrieveDataWithCredential(credential).then(function(usercred) {
                window.history.replaceState(null, null, window.location.pathname);
                // The provider is now successfully linked.
                updateUserText();
            }).catch(function(error) {
                // Some error occurred.
            });
        } else {
            firebase.auth().signInWithEmailLink(email, window.location.href).then(function(result) {
                // Clear email from storage.
                window.history.replaceState(null, null, window.location.pathname);
                window.localStorage.removeItem('emailForSignIn');
                updateUserText();
                // You can access the new user via result.user
                // result.additionalUserInfo.profile == null
                // result.additionalUserInfo.isNewUser
            }).catch(function(error) {
                // Some error occurred, you can inspect the code: error.code
                // Common errors could be invalid email and invalid or expired OTPs.
            });
        }
    }
}());