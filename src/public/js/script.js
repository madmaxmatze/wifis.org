console.log("Wifis.org ♥ developer - join @ https://github.com/madmaxmatze/wifis.org");

// embed Google Tag Manager
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-M6XKF9N');

// minimal js for <head>
document.documentElement.classList.replace("no-js", "js");
location.hash = location.hash.replace(/^\#\_\=\_$/, ""); /* facebook redirect: https://stackoverflow.com/q/7131909 */

// onDocumentReady
document.addEventListener("DOMContentLoaded", () => {
    // remove href from Lang drop down Link
    document.querySelector(".langNav .dropdown-toggle").href = "javascript:void(0);";

    // add collapse logic to toggle of navigation bar for small screens 
    document.querySelector("nav .navbar-toggler").addEventListener("click", (event) => {
        document.querySelector("nav .navbar-collapse").classList.toggle("collapse"); 
    });
});