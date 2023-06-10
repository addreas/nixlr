{ pkgs, ... }: {
  imports = [
    ../../packages/kube
  ];

  services.kubeadm = {
    enable = true;
    package = pkgs.kubernetes;
  };

  environment.systemPackages = [ pkgs.kubernetes ];
}
