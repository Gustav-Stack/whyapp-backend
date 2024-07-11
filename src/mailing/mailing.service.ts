import { Injectable } from '@nestjs/common';
import { ISendEmail } from './entities/sendEmail';
import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

@Injectable()
export class MailingService {
  constructor() {
    this.mailerService = new Resend(RESEND_API_KEY);
  }
  private readonly mailerService: Resend;

  private async sendEmail(
    data: ISendEmail,
    html: { default?: string; react?: string },
  ) {
    const { subject, text, to } = data;
    const env = await this.getEnv();
    if (!(env instanceof Error)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { PROFESSIONAL_EMAIL, PROFESSIONAL_NAME } = env;
      try {
        const email = await this.mailerService.emails.send({
          from: `${PROFESSIONAL_NAME} <${PROFESSIONAL_EMAIL}>`,
          to,
          subject,
          text,
          html: html.default ? html.default : html.react,
        });
        console.log('Email enviado com sucesso: ', email);
      } catch (error) {
        console.log('Um erro grave ocorreu ao enviar o email \n', error);
      }
    } else {
      console.log(env.message, ' Erro ao encontrar variáveis de ambiente.');
    }
  }

  async sendLogin(data: ISendEmail) {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    await this.sendEmail(data, {
      default: `
        <div style='display:flex; justify-content:center; align-items:center; flex-direction:column; font-size:1.2rem'>
          <h1>Olá, ${data.userName}!</h1>
          <p>Novo login efetuado às ${time}, no dia ${date}</p>
          <p><i>Clique no botão abaixo se não foi você e efetue a troca da senha</i></p>
          <button style="background-color:green; width:200px; height:50px; border-radius:7px;">TROCAR SENHA</button>
        </div>
        `,
    });
  }

  async sendRegister(data: ISendEmail) {
    await this.sendEmail(data, {
      default: `
        <div style='display:flex; justify-content:center; align-items:center; flex-direction:column; font-size:1.2rem'>
          <h1>Bem vindo(a), ${data.userName}!</h1>
          <p>Estamos muito felizes em te ver por aqui. Esperamos que você tenha a melhor experiência em nosso aplicativo</p>
          <p><i>Para finalizar seu cadastro, <a href='' target='_blank'>clique aqui</a> ou no botão abaixo para confirmar seu email e ativar a conta</i></p>
          <button style="background-color:green; width:200px; height:50px; border-radius:7px;">CONFIRMAR</button>
          <br />
          <p>Se precisar entre com contato conosco! Iremos te atender em até 24h.</p>
        </div>
        `,
    });
  }

  async sendResetPasswordCode(data: ISendEmail, code: string) {
    await this.sendEmail(data, {
      default: `
        <div style='display:flex; justify-content:center; align-items:center; flex-direction:column; font-size:1.2rem'>
          <h1>Olá, ${data.userName}!</h1>
          <p>Aqui está seu código para a troca de senha</p>
          <div style='background-color:gray; width:300px; height:200px; display:flex; align-items:center; justify-content:center;'>
            <p style='font-size:1.6rem; font-weight:800;'>${code}</p>
          </div>
          <p><i>Lembre-se de não enviar este código para ninguém, <a href='' target='_blank'>clique aqui</a> ou no botão abaixo se não foi você</i></p>
          <button style="background-color:green; width:200px; height:50px; border-radius:7px;">SUPORTE</button>
          <br />
          <p>Se precisar entre com contato conosco! Iremos te atender em até 24h.</p>
        </div>
        `,
    });
  }

  async sendResetPasswordNotfication(data: ISendEmail) {
    await this.sendEmail(data, {
      default: `
        <div style='display:flex; justify-content:center; align-items:center; flex-direction:column; font-size:1.2rem'>
          <h1>Olá, ${data.userName}. Atenção!</h1>
          <p>SUA SENHA FOI ALTERADA</p>
          <p><i>Se não foi você, <a href='' target='_blank'>clique aqui</a> ou no botão abaixo</i></p>
          <button style="background-color:green; width:200px; height:50px; border-radius:7px;">SUPORTE</button>
          <br />
          <p>Se precisar entre com contato conosco! Iremos te atender em até 24h.</p>
        </div>
        `,
    });
  }

  private async getEnv() {
    const PROFESSIONAL_EMAIL = process.env.PROFESSIONAL_EMAIL
      ? process.env.PROFESSIONAL_EMAIL
      : undefined;
    const PROFESSIONAL_NAME = process.env.PROFESSIONAL_NAME
      ? process.env.PROFESSIONAL_NAME
      : undefined;

    if (!PROFESSIONAL_EMAIL) {
      return new Error(
        'Variável de ambiente PROFESSIONAL_EMAIL não foi encontrada.',
      );
    } else if (!PROFESSIONAL_NAME) {
      return new Error(
        'Variável de ambiente PROFESSIONAL_NAME não foi encontrada.',
      );
    }
    return {
      PROFESSIONAL_EMAIL,
      PROFESSIONAL_NAME,
    };
  }
}
