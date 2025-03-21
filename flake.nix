{
  description = "Beans Applications";

  inputs.nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";

  outputs =
    {
      self,
      nixpkgs,
    }:
    let
      mkBeans =
        package:
        let
          pname = package.pname;
          name = package.name;
          title = package.title;
          system = package.system;
          description = package.description;
          version = package.version;

          src = ./.;

          pkgs = import nixpkgs { inherit system; };

          desktopItem = pkgs.makeDesktopItem {
            desktopName = title;
            comment = description;
            name = pname;
            exec = pname;
            icon = pname;
            terminal = false;
            categories = [ "Graphics" ];
          };

        in
        pkgs.stdenv.mkDerivation {
          inherit pname;
          inherit version;
          inherit src;

          nativeBuildInputs = with pkgs; [
            nodejs_23
            makeWrapper
          ];

          buildInputs = with pkgs; [
            nwjs
          ];

          phases = [
            "buildPhase"
            "installPhase"
          ];

          buildPhase = ''
            runHook preBuild

            cp -r ${src}/* .
            node generate.js

            runHook postBuild
          '';

          installPhase = ''
            runHook preInstall

            mkdir -p $out/bin $out/pkgs
            cp -r out/${name} $out/pkgs

            substituteInPlace $out/pkgs/${name}/package.json \
            --replace-fail "${name}" "${pname}"

            for size in 16 32 64 128 256; do
              install -Dm644 icons/"$size"/${name}.png \
              $out/share/icons/hicolor/"$size"x"$size"/apps/${pname}.png
            done

            install -Dm644 ${desktopItem}/share/applications/${pname}.desktop -t $out/share/applications
            makeWrapper ${pkgs.nwjs}/bin/nw $out/bin/${pname} --add-flags $out/pkgs/${name}

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
          pname = builtins.fromJSON ''"\u0070\u0068\u006f\u0074\u006f\u0070\u0065\u0061"'';
          title = builtins.fromJSON ''"\u0050\u0068\u006f\u0074\u006f\u0070\u0065\u0061"'';
          description = builtins.fromJSON ''"\u0052\u0061\u0073\u0074\u0065\u0072\u0020\u0067\u0072\u0061\u0070\u0068\u0069\u0063\u0073\u0020\u0065\u0064\u0069\u0074\u006f\u0072"'';
          inherit system;
          version = "0.0.1";
        };
        vbean = mkBeans {
          name = "vbean";
          pname = builtins.fromJSON ''"\u0076\u0065\u0063\u0074\u006f\u0072\u0070\u0065\u0061"'';
          title = builtins.fromJSON ''"\u0056\u0065\u0063\u0074\u006f\u0072\u0070\u0065\u0061"'';
          description = builtins.fromJSON ''"\u0056\u0065\u0063\u0074\u006f\u0072\u0020\u0067\u0072\u0061\u0070\u0068\u0069\u0063\u0073\u0020\u0065\u0064\u0069\u0074\u006f\u0072"'';
          inherit system;
          version = "0.0.1";
        };
      });
    };
}
