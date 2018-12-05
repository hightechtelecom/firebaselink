(function() {
    // Initialize Firebase ENTER YOUR PROJECT CONFIG HERE
    var config = {
        apiKey: "--------------------------------------",
        authDomain: "----------.firebaseapp.com",
        databaseURL: "https://---------.firebaseio.com",
        projectId: "-----------",
        storageBucket: "-----------.appspot.com",
        messagingSenderId: "------------------"
    };
    var firebase = window.firebase;
    firebase.initializeApp(config);
    firebase.firestore().settings({timestampsInSnapshots: true});
    var db = firebase.firestore();
    var previousUser = null;
    var localUserDoc = null;
    if(document.getElementById("signin-submit-button")){
        document.getElementById("signin-submit-button").addEventListener('click', async function(e) {
            if(document.getElementById("email-input").checkValidity()){
                var emailAddress = document.getElementById("email-input").value;
                var actionCodeSettings = {
                    url: 'https://firebase.hightechtele.com',
                    handleCodeInApp: true
                };
                firebase.auth().sendSignInLinkToEmail(emailAddress, actionCodeSettings);
                document.getElementById("signup-email-address-span").innerText = emailAddress;
                document.getElementById("signup-enter-email-div").classList.remove("signup-body-displayed");
                document.getElementById("signup-check-email-div").classList.add("signup-body-displayed");                    
                window.localStorage.setItem('emailForSignIn', emailAddress);
            }
        });
    }
    if(document.getElementById("add-apple-button")){
        document.getElementById("add-apple-button").addEventListener('click', async function(e) {
            //add apple to this users cart
            var userObj = {};
            userObj.apples = 1;
            //USER NOT SIGNED IN
            if(!firebase.auth().currentUser){
                //DISABLE ADD APPLES BUTTON UNTIL USER AND USER RECORD IS CREATED AND READY
                document.getElementById("add-apple-button").setAttribute("disabled","disabled");
                var firebaseUserObj = await firebase.auth().signInAnonymously();
                userObj.created = Date.now();
                await db.collection("users").doc(firebaseUserObj.user.uid).set(userObj);
                document.getElementById("add-apple-button").removeAttribute("disabled");
            } else {
                //USER ALREADY SIGNED IN
                var userDoc = await db.collection("users").doc(firebase.auth().currentUser.uid).get();
                userObj.updated = Date.now();
                if (userDoc.exists) {
                    if(userDoc.data().apples){
                        userObj.apples = userDoc.data().apples + 1;
                    }
                    await db.collection("users").doc(firebase.auth().currentUser.uid).update(userObj);
                } else {
                    await db.collection("users").doc(firebase.auth().currentUser.uid).set(userObj);
                }
            }
        });
    }
    if(document.getElementById("sign-in-button")){
        document.getElementById("sign-in-button").addEventListener('click', function(e) {
            window.location.href = "/signin";
        });
    }
    if(document.getElementById("sign-out-button")){
        document.getElementById("sign-out-button").addEventListener('click', function(e) {
            if(firebase.auth().currentUser){
                //ANONYMOUS USERS EXITING APP WILL LEAVE ORPHANED DOCUMENTS/CARTS IN FIRESTORE
                if(firebase.auth().currentUser.isAnonymous){
                    var confirmation = confirm("Changes May Be Lost");
                    if (confirmation == false) {
                        return;
                    }                   
                }
                firebase.auth().signOut();
            }
        });
    }
    firebase.auth().onAuthStateChanged(function(user) {
        if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
            signInWithEmailLinkHandler();
        }
        if (user) {
            db.collection("users").doc(user.uid).onSnapshot(function (userDoc) {
                localUserDoc = userDoc;
                if(document.getElementById("user-apple-count-span")){
                    if (userDoc.exists) {
                        if(userDoc.data().apples) {
                            document.getElementById("user-apple-count-span").innerText = userDoc.data().apples;
                        }
                    } else {
                        document.getElementById("user-apple-count-span").innerText = "none";
                    }
                }
            }, function(error) {});
        }
        updateUserText();
    });
    async function signInWithEmailLinkHandler(){
        var email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
            email = window.prompt('Please provide your email for confirmation');
        }
        // CAPTURE AND CONSTRUCT CREDENTIAL FROM EMAIL ADDRESS AND URL QUERY PARAMETER
        var credential = firebase.auth.EmailAuthProvider.credentialWithLink(email, window.location.href);        
        // IF THERE IS CURRENT USER, LINK CREDENTIAL TO IT
        if(firebase.auth().currentUser){
            var apples = 0;
            try {
                await firebase.auth().currentUser.linkAndRetrieveDataWithCredential(credential);
                window.history.replaceState(null, null, window.location.pathname);
                updateUserText();
            } catch (error) {
                if(error.code === "auth/email-already-in-use"){
                    // REMEMBER AUTH CURRENT USER OBJECT
                    previousUser = firebase.auth().currentUser;
                    // WE MUST HANDLE DB READ AND DELETE WHILE SIGNED IN AS PREVIOUS USER PER FIRESTORE SECURITY RULES
                    if(localUserDoc){
                        if(localUserDoc.data().apples){
                            apples = localUserDoc.data().apples;
                        }                    
                    }
                    //DELETE CURRENT USER RECORD WHILE STILL SIGNED IN
                    await firebase.firestore().collection("users").doc(previousUser.uid).delete();
                    // CLEAN UP DONE. NOW SIGN IN USING EMAIL LINK CREDENTIAL
                    try {
                        var firebaseUserObj = await firebase.auth().signInAndRetrieveDataWithCredential(credential);
                        // FIRESTORE USER RECORD FOR EMAIL LINK USER WAS CREATED WHEN THEY ADDED APPLE TO CART
                        try {
                            var doc = await firebase.firestore().collection("users").doc(firebaseUserObj.user.uid).get();
                            if (doc.exists) {
                                if(doc.data().apples){
                                    apples = apples + doc.data().apples;
                                }
                            }
                            await firebase.firestore().collection("users").doc(firebaseUserObj.user.uid).update({
                                apples: apples
                            });
                        } catch(error) {
                            console.log("Error getting document:", error);
                        }
                        previousUser.delete();
                    } catch (error) {
                        console.log(".signInWithCredential err ", error);
                    }
                }
            }
        } else {
            await firebase.auth().signInWithEmailLink(email, window.location.href);
        }
        window.history.replaceState(null, null, window.location.pathname);
        window.localStorage.removeItem('emailForSignIn');
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
}());