{
  description = "Beans Applications";

  inputs.nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";

  outputs =
    {
      self,
      nixpkgs,
    }:
    let
      version = "0.1.2";
      mkBeans =
        package:
        let
          pname = package.pname;
          name = package.name;
          title = package.title;
          system = package.system;
          description = package.description;
          version = package.version;
          type = package.type;
          dev = package.dev;

          src = ./.;

          pkgs = import nixpkgs { inherit system; };

          desktopItem = pkgs.makeDesktopItem {
            desktopName = title;
            comment = description;
            name = pname;
            exec = "${pname} %F";
            icon = pname;
            terminal = false;
            categories = [ "Graphics" ];
            mimeTypes = [
              "image/vnd.adobe.photoshop"
              "application/x-photoshop"
              "application/illustrator"
              "application/x-zerosize"
              "image/x-xcf"
              "application/x-cabri"
              "application/vnd.corel-draw"
              "image/png"
              "image/svg+xml"
              "image/x-eps"
              "application/pdf"
              "image/wmf"
              "image/emf"
              "image/jpeg"
              "image/gif"
              "image/webp"
              "image/vnd.microsoft.icon"
              "image/x-icns"
              "image/bmp"
              "image/avif"
              "image/heif"
              "image/jxl"
              "image/x-portable-pixmap"
              "image/x-portable-graymap"
              "image/x-portable-bitmap"
              "image/tiff"
              "image/x-dds"
              "image/x-ilbm"
              "image/x-exr"
              "image/x-hdr"
              "image/x-tga"
              "image/x-adobe-dng"
              "image/x-nikon-nef"
              "image/x-canon-cr2"
              "image/x-canon-cr3"
              "image/x-sony-arw"
              "image/x-panasonic-rw2"
              "image/x-fuji-raf"
              "image/x-olympus-orf"
              "image/x-kde-raw"
              "image/apng"
              "video/mp4"
              "video/webm"
              "video/x-matroska"
            ];
          };

        in
        pkgs.stdenv.mkDerivation {
          inherit pname;
          inherit version;
          inherit src;

          nativeBuildInputs = with pkgs; [
            nodejs
            makeWrapper
          ];

          buildInputs = with pkgs; [
            (if dev then nwjs-sdk else nwjs)
            ffmpeg
            imagemagick
          ];

          phases = [
            "buildPhase"
            "installPhase"
          ];

          buildPhase = ''
            runHook preBuild
            cp -r ${src}/* .
            mkdir -p out/${name}
            node generate.js ${name}
            runHook postBuild
          '';

          installPhase = ''
            runHook preInstall

            mkdir -p $out/bin $out/pkgs
            cp -r out/${name} $out/pkgs

            substituteInPlace $out/pkgs/${name}/package.json \
            --replace-fail "${name}" "${pname}"

            for size in 16 32 64 128 256; do
              install -Dm644 icons/"$size"/${type}.png \
              $out/share/icons/hicolor/"$size"x"$size"/apps/${pname}.png
            done

            install -Dm644 ${desktopItem}/share/applications/${pname}.desktop -t $out/share/applications
            makeWrapper ${if dev then pkgs.nwjs-sdk else pkgs.nwjs}/bin/nw $out/bin/${pname} \
              --add-flags $out/pkgs/${name} \
              --set BEANS_FFMPEG ${pkgs.ffmpeg}/bin/ffmpeg \
              --set BEANS_MAGICK ${pkgs.imagemagick}/bin/magick

            runHook postInstall
          '';
        };

      supportedSystems = [ "x86_64-linux" ];
      forAllSystems = nixpkgs.lib.genAttrs supportedSystems;
    in
    {
      packages = forAllSystems (system: {
        pbean = mkBeans {
          name = "pbean";
          type = "pbean";
          pname = builtins.fromJSON ''"\u0070\u0068\u006f\u0074\u006f\u0070\u0065\u0061"'';
          title = builtins.fromJSON ''"\u0050\u0068\u006f\u0074\u006f\u0070\u0065\u0061"'';
          description = builtins.fromJSON ''"\u0052\u0061\u0073\u0074\u0065\u0072\u0020\u0067\u0072\u0061\u0070\u0068\u0069\u0063\u0073\u0020\u0065\u0064\u0069\u0074\u006f\u0072"'';
          inherit system;
          inherit version;
          dev = false;
        };
        vbean = mkBeans {
          name = "vbean";
          type = "vbean";
          pname = builtins.fromJSON ''"\u0076\u0065\u0063\u0074\u006f\u0072\u0070\u0065\u0061"'';
          title = builtins.fromJSON ''"\u0056\u0065\u0063\u0074\u006f\u0072\u0070\u0065\u0061"'';
          description = builtins.fromJSON ''"\u0056\u0065\u0063\u0074\u006f\u0072\u0020\u0067\u0072\u0061\u0070\u0068\u0069\u0063\u0073\u0020\u0065\u0064\u0069\u0074\u006f\u0072"'';
          inherit system;
          inherit version;
          dev = false;
        };
        pbean-dev = mkBeans {
          name = "pbean-dev";
          type = "pbean";
          pname = builtins.fromJSON ''"\u0070\u0068\u006f\u0074\u006f\u0070\u0065\u0061-dev"'';
          title = builtins.fromJSON ''"\u0050\u0068\u006f\u0074\u006f\u0070\u0065\u0061 Dev"'';
          description = builtins.fromJSON ''"\u0052\u0061\u0073\u0074\u0065\u0072\u0020\u0067\u0072\u0061\u0070\u0068\u0069\u0063\u0073\u0020\u0065\u0064\u0069\u0074\u006f\u0072"'';
          inherit system;
          inherit version;
          dev = true;
        };
        vbean-dev = mkBeans {
          name = "vbean-dev";
          type = "vbean";
          pname = builtins.fromJSON ''"\u0076\u0065\u0063\u0074\u006f\u0072\u0070\u0065\u0061-dev"'';
          title = builtins.fromJSON ''"\u0056\u0065\u0063\u0074\u006f\u0072\u0070\u0065\u0061 Dev"'';
          description = builtins.fromJSON ''"\u0056\u0065\u0063\u0074\u006f\u0072\u0020\u0067\u0072\u0061\u0070\u0068\u0069\u0063\u0073\u0020\u0065\u0064\u0069\u0074\u006f\u0072"'';
          inherit system;
          inherit version;
          dev = true;
        };
      });
    };
}
