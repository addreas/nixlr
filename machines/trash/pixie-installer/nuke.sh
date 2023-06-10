DEVICE=/dev/nvme1n1

MNT=/mnt/trash

set -e
set -x
sudo umount $MNT/boot $MNT/home $MNT/nix $MNT/var/lib $MNT/var/log $MNT || true

sudo parted --script ${DEVICE} \
                mklabel gpt \
                mkpart esp fat32 1MiB 512MiB \
                mkpart os btrfs 512MiB 100% \
                set 1 esp on \
                set 1 boot on

sudo mkfs.fat -F 32 ${DEVICE}p1
sudo mkfs.btrfs ${DEVICE}p2 -f

P2=${DEVICE}p2
sudo mount -t btrfs "$P2" $MNT/
sudo btrfs subvolume create $MNT/@
sudo btrfs subvolume create $MNT/@home
sudo btrfs subvolume create $MNT/@nix
sudo btrfs subvolume create $MNT/@varlog
sudo btrfs subvolume create $MNT/@varlib
sudo umount $MNT

sudo mount -t btrfs -o noatime,compress=zstd,subvol=@ "$P2" $MNT
sudo mkdir -p $MNT/{boot,home,nix,var/log,var/lib}
sudo mount -t vfat  -o defaults,noatime ${DEVICE}p1 $MNT/boot
sudo mount -t btrfs -o noatime,compress=zstd,subvol=@home "$P2" $MNT/home
sudo mount -t btrfs -o noatime,compress=zstd,subvol=@nix "$P2" $MNT/nix
sudo mount -t btrfs -o noatime,compress=zstd,subvol=@varlib "$P2" $MNT/var/lib
sudo mount -t btrfs -o noatime,compress=zstd,subvol=@varlog "$P2" $MNT/var/log

sudo nixos-generate-config --root $MNT
sudo mv $MNT/etc/nixos $MNT/etc/nixos-generated

TMP=$(mktemp -d)
git clone git@github.com:addreas/flakefiles.git $TMP
sudo mv $TMP $MNT/etc/nixos

sudo cp $MNT/etc/nixos-generated/hardware-configuration.nix $MNT/etc/nixos/machines/$(hostname)


./mkshadow.d.sh addem $MNT

sudo nixos-install --flake "$MNT/etc/nixos#$(hostname)" --root $MNT --no-root-password

(
  cd $MNT/etc/nixos
  git commit -am "add newly generated hardware-configuration.nix for $(hostname)"
  git push
)

echo umount $MNT/boot $MNT/home $MNT/nix $MNT/var/lib $MNT/var/log $MNT
# reboot
