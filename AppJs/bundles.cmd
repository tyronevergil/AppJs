node .\Scripts\r.js -o optimizeCss=standard cssIn=.\Content\Site.css out=.\Content\Site.min.css
node .\Scripts\r.js -o optimizeCss=standard preserveLicenseComments=false cssIn=.\Content\app.css out=.\Content\app.min.css
node .\Scripts\r.js -o skipModuleInsertion=true include=.\App\app.init out=.\App\app.init.min.js
node .\Scripts\r.js -o skipModuleInsertion=true include=.\App\app.config,.\App_Modules\modules.config,.\App_Widgets\widgets.config out=.\App\app.config.min.js
node .\Scripts\r.js -o .\App_Modules\modules.build.js
node .\Scripts\r.js -o .\App_Widgets\widgets.build.js
node .\Scripts\r.js -o .\App\app.build.js