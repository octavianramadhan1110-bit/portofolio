// Ambil elemen form dan tabel
const form = document.getElementById("crudForm");
const tableBody = document.querySelector("#dataTable tbody");

// Event Saat Submit Form
form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Ambil nilai input berdasarkan ID
    const matkul = document.getElementById("matkul").value;
    const judul = document.getElementById("judul").value;
    const deadline = document.getElementById("deadline").value; // format: YYYY-MM-DD
    const keterangan = document.getElementById("keterangan").value;
    const tipe = document.getElementById("tipe").value;

    // Validasi input
    if (matkul === "" || judul === "" || deadline === "") {
        alert("Harap isi semua data terlebih dahulu!");
        return;
    }

    // Ubah format tanggal jadi DD-MM-YYYY (aman, tanpa efek timezone)
    let tanggalFormatID = deadline;
    if (deadline.includes("-")) {
        const parts = deadline.split("-"); // [YYYY, MM, DD]
        // cek panjang parts untuk aman
        if (parts.length === 3) {
            tanggalFormatID = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
    }

    // Buat baris baru untuk tabel
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${matkul}</td>
        <td>${judul}</td>
        <td>${tanggalFormatID}</td>
        <td>${keterangan}</td>
        <td>${tipe}</td>
        <td>
            <button class="action-btn btn-delete">Hapus</button>
        </td>
    `;

    // Tambahkan aksi tombol Hapus
    row.querySelector(".btn-delete").addEventListener("click", function () {
        row.remove();
    });

    // Masukkan baris ke tabel
    tableBody.appendChild(row);

    // Reset form setelah tambah
    form.reset();
});