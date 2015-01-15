##Offline Website

This is a simple example of how to implement web-storage and cache manifest to create a web app that can function without internet connectivity.

####Functionality 

With this web app you will be able to:
- Save a post to our Postgres database when connected to the internet.
- When disconnected from the internet, submitting a post will save it locally in web-storage
- When reconnected to the internet you can click the `Sync Database` button to upload what is stored in web-storage. This will also delete the data from web-storage.

####Example

There is also a guide to setting up web-storage that has been written along side this web app. To see how to setup web-storage using IndexedDB visit the [related blog post]()
