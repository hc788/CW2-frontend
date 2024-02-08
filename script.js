// vue js app for purchasing after school lessons
let app = new Vue({
    el: '#Task',
    data: {
        sitename: 'After School Classes',
        showProduct: true,
        order: {
            name: '',
            phoneNumber: '',
            method: 'Home',
            gift: '',
            sendGift: 'Send as a gift',
            dontSendGift: 'Do not send as a gift',
            
        },
        lessons: [], //lessons
        cart: [],
        lessonsId: [],
        sortBy: 'Subject',
        direction: 'Asending',
        searchLesson: '',
        imgPath: '',
        serverURL: "https://lessonstoreapp2-env.eba-iqtais9f.eu-west-2.elasticbeanstalk.com/collections/lessons"

    },
    created: function() {

        this.getData();
        // //one fetch that retrieves all the lessons with GET 
        // fetch("http://localhost:3000/collections/lessons").then(
        fetch("https://lessonstoreapp2-env.eba-iqtais9f.eu-west-2.elasticbeanstalk.com/collections/lessons").then(
            function(response){
                response.json().then(
                    function(json){
                        app.lessons = json;
                    }
                )
            }
        );

        if ("serviceWorker" in navigator) {
            //retrieve service workers and check if there is one with the name of the file
            //only if the above is false, do the registration below
            navigator.serviceWorker.register("service-worker.js");
        }
        
    },

    methods: {
        //the data that comes from the data array in lessons.js
        getData: function () {
            this.lessons = data;

        },
        //adding to cart and updating the availabilty of lessons
        addToCartButton: function (lesson) {
            console.log(this.cart);
            this.cart.push(lesson);
            for (let i = 0; i < this.lessons.length; i++) {

                if (this.lessons[i].id == lesson.id) {
                    console.log(lesson.id);
                    console.log(this.lessons[i].id);
                    this.lessons[i].availableInventory--;
                }
            }
        },
        //product is visable 
        showCheckout() {
            this.showProduct = this.showProduct ? false : true;
        },
        //delete the caches 
        deleteAllCaches() {
            caches.keys().then(function(names) {
             for (let name of names)
            caches.delete(name);
             });
             console.log("All Caches Deleted");
        },
        //unregister service workers
        unregisterAllServiceWorkers() {
            navigator.serviceWorker.getRegistrations().then(function (registrations) {
             for (let registration of registrations) {
            registration.unregister()
             }
             });
             console.log("ServiceWorkers Unregistered");
        },
        reloadPage(){
            window.location.reload();
        },
        //submit form function 
        submitForm: function () {
            let name = this.order.name;
            let phoneNum = this.order.phoneNumber;

            this.grabIdFromCart();

            const info = [];
            info.push({
                n: name,
                phone: phoneNum,
                basketInfo: this.lessonsId
            })

            const availability = [];
            
            for(let i=0; i < this.lessonsId.length; i++){
                availability.push({id:this.lessonsId[i].id, spaces:this.lessonsId[i].spaces});
                    
            }

            console.log(availability);
            

            //one fetch that saves a new order with POST after it is submitted
          //  fetch("http://localhost:3000/collections/orders",
            fetch("https://lessonstoreapp2-env.eba-iqtais9f.eu-west-2.elasticbeanstalk.com/collections/orders",
             {
                method: "POST",
                headers:{
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    info
                })
            })
                .then(function(res) { return res.json(); })
                .then(function(body) {alert (JSON.stringify(body))
             })

            // one fetch that updates the available lesson space with PUT after an order is submitted
            // sends a put request with an array of info that needs to be updated
             fetch("https://lessonstoreapp2-env.eba-iqtais9f.eu-west-2.elasticbeanstalk.com/lessons",
             {
                method: "PUT",
                headers:{
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    availability
                })
            })
                .then(function(res) { return res.json(); })
                .then(function(body) {alert (JSON.stringify(body))
             })

            
        },
        //a function that removes lesson from cart 
        removeFromCartButton: function (lesson) {

            for (let i = 0; i < this.cart.length; i++) {
                if (this.cart[i].id === lesson.id) {
                    let start = this.cart.splice(0, i);
                    let finish = this.cart.splice(i + 1, this.cart.length);
                    this.cart = [...start, ...finish];
                    for (let i = 0; i < this.lessons.length; i++) {
                        if (this.lessons[i].id === lesson.id) {

                            this.lessons[i].availableInventory++;
                        }
                    }
                    return;
                }
            }
        },
        //button becomes disables when there is no more lessons left
        isDisabled: function (lesson) {
            return lesson.availableInventory < 1;
        },
        //regular expressions for letter validation, to check that the user is only inputing a letter 
        isLetter: function (event) {
            if (/\d+/.test(event.key)) {
                return event.preventDefault();
            }

        },
        ////regular expressions for number validation, to check that the user is only inputing a number 
        isNumber: function (event) {
            if (!/[0-9]/.test(event.key)) {
                return event.preventDefault();
            }
        },
        ///function will grab id from all items in cart
        grabIdFromCart: function(){
            for(let i=0; i < this.cart.length; i++){
                this.lessonsId.push({id:this.cart[i].id, spaces:this.cart[i].availableInventory});
                    
            }
        }
        
    },
    computed: {
        //function that counts the item in the cart 
        cartItemCount: function () {
            return this.cart.length || "";
        },
        //the user will be able to add to cart if there availablitly for the lesson is biger than 0
        canAddToCart(lesson) {
            return lesson.availableInventory > this.cartItemCount(lesson.id);
        },
        //the submit button will only be visable once the user has entered name and phone number
        canSubmitForm: function () {
            if (this.cart.length > 0 && this.order.name != '' && this.order.phoneNumber != '')
                return true;
            else
                return false;
        },
        //after the user adds lessons to cart the availabilty gets decreased
        itemsLeft() {
            return this.lessons.availableInventory - this.cartItemCount;
        },
        //sorting the lessons by subject,location,price and availability in ascending and descending order
        sortedProducts() {

            return this.lessons.sort((a, b) => {
                if (this.direction == 'Asending') {
                    if (this.sortBy == 'Subject') {
                        if (a.subject > b.subject) return 1;
                        if (a.subject < b.subject) return -1;
                        return 0;

                    }
                    else if (this.sortBy == 'Location') {
                        if (a.location > b.location) return 1;
                        if (a.location < b.location) return -1;
                        return 0;
                    }
                    else if (this.sortBy == 'Price') {
                        if (parseInt(a.price) > parseInt(b.price)) return 1;
                        if (parseInt(a.price) < parseInt(b.price)) return -1;
                        return 0;
                    }
                    else if (this.sortBy == 'Availability') {
                        if (a.availableInventory > b.availableInventory) return 1;
                        if (a.availableInventory < b.availableInventory) return -1;
                        return 0;
                    }
                }
                else {
                    if (this.sortBy == 'Subject') {
                        if (a.subject > b.subject) return -1;
                        if (a.subject < b.subject) return 1;
                        return 0;

                    }
                    else if (this.sortBy == 'Location') {
                        if (a.location > b.location) return -1;
                        if (a.location < b.location) return 1;
                        return 0;
                    }
                    else if (this.sortBy == 'Price') {
                        if (parseInt(a.price) > parseInt(b.price)) return -1;
                        if (parseInt(a.price) < parseInt(b.price)) return 1;
                        return 0;
                    }
                    else if (this.sortBy == 'Availability') {
                        if (a.availableInventory > b.availableInventory) return -1;
                        if (a.availableInventory < b.availableInventory) return 1;
                        return 0;
                    }

                }

            });

        },
         //search functionality
         filteredLessons() {
            return this.sortedProducts.filter((lesson) => {
                return lesson.subject.match(this.searchLesson);
            });
        },


    },
});