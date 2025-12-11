#!/usr/bin/env python3
import sys
import zipfile
import struct
import os

PAGE_SIZE = 16384  # 16KB

def is_elf_segment_aligned(elf_path, page_size=PAGE_SIZE):
    not_aligned = []
    with open(elf_path, 'rb') as f:
        # Check ELF magic
        if f.read(4) != b'\x7fELF':
            return False, "Not an ELF file", []
        f.seek(0)
        e_ident = f.read(16)
        elf_class = e_ident[4]
        if elf_class == 1:
            elf_hdr_fmt = '<HHIIIIIHHHHHH'
            phdr_fmt = '<IIIIIIII'
            elf_hdr_size = 52
            phdr_size = 32
        elif elf_class == 2:
            elf_hdr_fmt = '<HHIQQQIHHHHHH'
            phdr_fmt = '<IIQQQQQQ'
            elf_hdr_size = 64
            phdr_size = 56
        else:
            return False, "Unknown ELF class", []

        f.seek(16)
        elf_hdr = struct.unpack(elf_hdr_fmt, f.read(elf_hdr_size - 16))
        if elf_class == 1:
            e_phoff = elf_hdr[4]
            e_phentsize = elf_hdr[7]
            e_phnum = elf_hdr[8]
        else:
            e_phoff = elf_hdr[4]
            e_phentsize = elf_hdr[7]
            e_phnum = elf_hdr[8]

        for i in range(e_phnum):
            f.seek(e_phoff + i * e_phentsize)
            phdr = struct.unpack(phdr_fmt, f.read(phdr_size))
            if elf_class == 1:
                p_type, p_offset, p_vaddr, p_paddr, p_filesz, p_memsz, p_flags, p_align = phdr
            else:
                p_type, p_flags, p_offset, p_vaddr, p_paddr, p_filesz, p_memsz, p_align = phdr
            if p_type == 1:  # PT_LOAD
                if (p_offset % page_size != 0) or (p_vaddr % page_size != 0):
                    not_aligned.append({'segment': i, 'offset': p_offset, 'vaddr': p_vaddr})
        if not_aligned:
            msg = f"{len(not_aligned)} segment(s) not aligned"
            return False, msg, not_aligned
        return True, "All loadable segments are aligned", []

def check_apk_elf_alignment(apk_path):
    with zipfile.ZipFile(apk_path, 'r') as apk:
        elf_files = [f for f in apk.namelist() if f.startswith('lib/') and f.endswith('.so')]
        if not elf_files:
            print("😕 No ELF files found in APK.")
            return
        for elf_file in elf_files:
            with apk.open(elf_file) as ef:
                tmp_path = f'/tmp/{os.path.basename(elf_file)}'
                with open(tmp_path, 'wb') as out:
                    out.write(ef.read())
                aligned, msg, _ = is_elf_segment_aligned(tmp_path)
                print(f"{elf_file}: {'✅ Aligned' if aligned else '❌ Not aligned'} ({msg})")
                os.remove(tmp_path)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 check_apk_elf_alignment.py <your.apk>")
        sys.exit(1)
    check_apk_elf_alignment(sys.argv[1])
