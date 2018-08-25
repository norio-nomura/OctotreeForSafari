APPICON_DIR = OctotreeForSafari/Assets.xcassets/AppIcon.appiconset

.PHONY: bootstrap upstream update_css update_fonts update_icons update_octotree_files

bootstrap:
	@git submodule update --init --recursive
	@mkdir -p upstream/tmp

upstream/package.json: bootstrap
upstream/package-lock.json: upstream/package.json
	cd upstream && npm install

upstream: upstream/package-lock.json
	cd upstream && gulp safari

# update_octotree_files's dependencies
upstream/libs/file-icons.css: bootstrap
octotree/file-icons.css: upstream/libs/file-icons.css
	sed 's|\.\./fonts|fonts|' < $< > $@
	touch -r $< $@

upstream/tmp/octotree.js: upstream/package-lock.json
	cd upstream && gulp safari:js

octotree/octotree.js: upstream/tmp/octotree.js
	cp -p $< $@

upstream/libs/ondemand/*: bootstrap
upstream/tmp/ondemand.js: upstream/package-lock.json upstream/libs/ondemand/*
	cd upstream && gulp lib:ondemand

octotree/ondemand.js: upstream/tmp/ondemand.js
	cp -p $< $@

upstream/libs/*.css: bootstrap
update_css: upstream/libs/*.css
ifeq ($(MAKELEVEL), 0)
	@$(MAKE) $@
else
	cp -p $(filter-out upstream/libs/file-icons.css, $^) octotree
endif

upstream/libs/fonts/*: bootstrap
update_fonts: upstream/libs/fonts/*
ifeq ($(MAKELEVEL), 0)
	@$(MAKE) $@
else
	cp -p $^ octotree/fonts
endif

update_icons: $(APPICON_DIR)/*.png
ifeq ($(MAKELEVEL), 0)
	@$(MAKE) $@
endif

$(APPICON_DIR)/%.png: upstream/icons/%.png
	cp -p $< $@

upstream/libs/*.js: bootstrap
update_js: upstream/libs/*.js
ifeq ($(MAKELEVEL), 0)
	@$(MAKE) $@
else
	cp -p $^ octotree
endif

fix_file_modes:
	chmod 644 octotree/*.css octotree/*.js octotree/fonts/*

update_octotree_files: octotree/file-icons.css octotree/octotree.js octotree/ondemand.js update_css update_fonts update_icons update_js fix_file_modes

XCODE_FLAGS = -project OctotreeForSafari.xcodeproj -scheme OctotreeForSafari CODE_SIGN_IDENTITY="Developer ID Application" CODE_SIGN_STYLE=Manual
ARCHIVE_PATH = OctotreeForSafari.xcarchive

build: update_octotree_files
	xcodebuild $(XCODE_FLAGS)

archive:
	xcodebuild $(XCODE_FLAGS) -archivePath $(ARCHIVE_PATH) archive

export: archive
	xcodebuild -exportArchive -archivePath $(ARCHIVE_PATH) -exportPath . -exportOptionsPlist export/options.plist
