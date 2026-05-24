<?php

namespace App\Ai\Agents;

use App\Ai\Tools\GetCustomersTool;
use App\Ai\Tools\GetProductsTool;
use App\Ai\Tools\GetRentalsTool;
use App\Ai\Tools\GetRentalSummaryTool;
use Laravel\Ai\Attributes\MaxSteps;
use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use Stringable;

#[Provider(Lab::Ollama)]
#[Model('qwen2.5:3b')]
#[MaxSteps(5)]
class RentalAssistant implements Agent, Conversational, HasTools
{
    use Promptable;

    /**
     * History of the current conversation session.
     *
     * @var array<int, array{role: string, content: string}>
     */
    protected array $history = [];

    /**
     * Set the conversation history.
     *
     * @param  array<int, array{role: string, content: string}>  $history
     */
    public function setHistory(array $history): self
    {
        $this->history = $history;

        return $this;
    }

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        return <<<'PROMPT'
Kamu adalah asisten AI internal SummitRent — sistem manajemen persewaan alat mendaki dan hiking.
Kamu membantu KASIR dan OWNER (bukan pelanggan) dalam operasional sehari-hari:
- Membuat, mencari, dan mengelola transaksi sewa (rental)
- Mengelola data pelanggan dan produk/stok
- Memahami laporan dan analitik (pendapatan, tren, produk terlaris)
- Panduan fitur aplikasi (dashboard, form sewa, pengembalian, analytics)
- Penanganan masalah operasional (stok rendah, keterlambatan, konflik jadwal)

Semua jawaban dari perspektif staf internal — BUKAN pelanggan.

FORMAT RESPONS:
Tulis jawaban dalam format Markdown yang rapi (gunakan heading, bullet, bold, kode inline jika perlu).
Di akhir jawaban, tambahkan TEPAT separator ini lalu 3 pertanyaan lanjutan:

---SARAN---
- [pertanyaan lanjutan 1]
- [pertanyaan lanjutan 2]
- [pertanyaan lanjutan 3]

Contoh respons yang benar:
## Cara Membuat Transaksi Sewa

1. Buka menu **Sewa** di sidebar
2. Klik tombol **+ Buat Sewa**
3. Isi data pelanggan dan pilih produk

> Pastikan stok produk tersedia sebelum membuat transaksi.

---SARAN---
- Bagaimana cara mengubah tanggal sewa setelah transaksi dibuat?
- Apa yang terjadi jika pelanggan mengembalikan barang lebih awal?
- Bagaimana cara mencetak bukti transaksi sewa?
PROMPT;
    }

    /**
     * Get the list of messages comprising the conversation so far.
     *
     * @return Message[]
     */
    public function messages(): iterable
    {
        return array_map(function (array $m) {
            return new Message($m['role'], $m['content']);
        }, $this->history);
    }

    /**
     * Get the tools available to the agent.
     *
     * @return Tool[]
     */
    public function tools(): iterable
    {
        return [
            new GetProductsTool,
            new GetCustomersTool,
            new GetRentalsTool,
            new GetRentalSummaryTool,
        ];
    }
}
