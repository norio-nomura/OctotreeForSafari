APP_NAME = OctotreeForSafari
APPICON_DIR = $(APP_NAME)/Assets.xcassets/AppIcon.appiconset

.PHONY: bootstrap upstream update_css update_fonts update_icons update_octotree_files

bootstrap:
	@git submodule update --init --recursive
	@mkdir -p upstream/tmp

update_safariextension: bootstrap
	cd upstream && npm install && npm start safari

# update_octotree_files's dependencies
remove_old_files:
	rm -f octotree/*.css octotree/*.js octotree/fonts/* octotree/images/*

octotree/file-icons.css: upstream/libs/file-icons.css
	sed 's|\.\./fonts|fonts|' < $< > $@
	touch -r $< $@

update_css: upstream/tmp/safari/octotree.safariextension/*.css
ifeq ($(MAKELEVEL), 0)
	@$(MAKE) $@
else
	cp -p $(filter-out upstream/tmp/safari/octotree.safariextension/file-icons.css, $^) octotree
endif

update_fonts: upstream/tmp/safari/octotree.safariextension/fonts/*
	mkdir -p octotree/fonts
ifeq ($(MAKELEVEL), 0)
	@$(MAKE) $@
else
	cp -p $^ octotree/fonts
endif

update_icons: $(APPICON_DIR)/*.png
ifeq ($(MAKELEVEL), 0)
	@$(MAKE) $@
endif

update_images: upstream/tmp/safari/octotree.safariextension/images/*
	mkdir -p octotree/images
ifeq ($(MAKELEVEL), 0)
	@$(MAKE) $@
else
	cp -p $^ octotree/images
endif

$(APPICON_DIR)/%.png: upstream/icons/%.png
	cp -p $< $@

update_js: upstream/tmp/safari/octotree.safariextension/*.js
ifeq ($(MAKELEVEL), 0)
	@$(MAKE) $@
else
	cp -p $^ octotree
endif

fix_file_modes:
	chmod 644 octotree/*.css octotree/*.js octotree/fonts/* octotree/images/*

update_octotree_files: update_safariextension remove_old_files octotree/file-icons.css update_css update_fonts update_icons update_images update_js fix_file_modes

EXPORT_PATH = .
APP_PATH?= $(EXPORT_PATH)/$(APP_NAME).app
ARCHIVE_PATH = $(EXPORT_PATH)/$(APP_NAME).xcarchive
XCODE_FLAGS = -project $(APP_NAME).xcodeproj -scheme $(APP_NAME) CODE_SIGN_IDENTITY="Developer ID Application" CODE_SIGN_STYLE=Manual
ZIP_PATH?= $(EXPORT_PATH)/$(APP_NAME).zip

$(ARCHIVE_PATH):
	xcodebuild $(XCODE_FLAGS) -archivePath $(ARCHIVE_PATH) archive

archive: $(ARCHIVE_PATH)

$(APP_PATH): $(ARCHIVE_PATH)
	xcodebuild -exportArchive -archivePath $(ARCHIVE_PATH) -exportPath $(EXPORT_PATH) -exportOptionsPlist export/options.plist

export: $(APP_PATH)

$(ZIP_PATH): $(APP_PATH)
	/usr/bin/ditto -c -k --keepParent $(APP_PATH) $(ZIP_PATH)

zip: $(ZIP_PATH)

notarize: zip
	xcrun altool --notarize-app --file $(ZIP_PATH) --primary-bundle-id "io.nor.OctotreeForSafari" --apiKey $(API_KEY) --apiIssuer $(API_ISSUER)
